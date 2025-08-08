package bridge

import (
	"bufio"
	"encoding/json"
	"fmt"
	"io"
	"os/exec"
	"sync"
	"time"
)

// Message types for IPC communication
const (
	MessageTypeCommand  = "command"
	MessageTypeResponse = "response"
	MessageTypeStream   = "stream"
	MessageTypeError    = "error"
	MessageTypeStatus   = "status"
	MessageTypeTool     = "tool"
)

// Message represents an IPC message
type Message struct {
	Type      string                 `json:"type"`
	ID        string                 `json:"id"`
	Content   string                 `json:"content"`
	Metadata  map[string]interface{} `json:"metadata,omitempty"`
	Timestamp time.Time              `json:"timestamp"`
}

// Response represents a response from the CLI
type Response struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
}

// CLIBridge manages communication with Research CLI
type CLIBridge struct {
	cmd       *exec.Cmd
	stdin     io.WriteCloser
	stdout    io.ReadCloser
	stderr    io.ReadCloser
	scanner   *bufio.Scanner
	mu        sync.Mutex
	callbacks map[string]func(Response)
	running   bool
}

// NewCLIBridge creates a new CLI bridge
func NewCLIBridge() (*CLIBridge, error) {
	// Start Research CLI in JSON mode
	cmd := exec.Command("research", "--json", "--no-interactive")
	
	stdin, err := cmd.StdinPipe()
	if err != nil {
		return nil, fmt.Errorf("failed to create stdin pipe: %w", err)
	}
	
	stdout, err := cmd.StdoutPipe()
	if err != nil {
		return nil, fmt.Errorf("failed to create stdout pipe: %w", err)
	}
	
	stderr, err := cmd.StderrPipe()
	if err != nil {
		return nil, fmt.Errorf("failed to create stderr pipe: %w", err)
	}
	
	if err := cmd.Start(); err != nil {
		return nil, fmt.Errorf("failed to start Research CLI: %w", err)
	}
	
	bridge := &CLIBridge{
		cmd:       cmd,
		stdin:     stdin,
		stdout:    stdout,
		stderr:    stderr,
		scanner:   bufio.NewScanner(stdout),
		callbacks: make(map[string]func(Response)),
		running:   true,
	}
	
	// Start reading responses
	go bridge.readLoop()
	
	return bridge, nil
}

// SendCommand sends a command to the CLI
func (b *CLIBridge) SendCommand(command string, callback func(Response)) error {
	b.mu.Lock()
	defer b.mu.Unlock()
	
	if !b.running {
		return fmt.Errorf("CLI bridge is not running")
	}
	
	// Generate message ID
	msgID := generateMessageID()
	
	// Store callback
	if callback != nil {
		b.callbacks[msgID] = callback
	}
	
	// Create message
	msg := Message{
		Type:      MessageTypeCommand,
		ID:        msgID,
		Content:   command,
		Timestamp: time.Now(),
	}
	
	// Send message
	data, err := json.Marshal(msg)
	if err != nil {
		return fmt.Errorf("failed to marshal message: %w", err)
	}
	
	_, err = b.stdin.Write(append(data, '\n'))
	if err != nil {
		return fmt.Errorf("failed to write to stdin: %w", err)
	}
	
	return nil
}

// SendQuery sends a query to the AI
func (b *CLIBridge) SendQuery(query string, options map[string]interface{}) error {
	metadata := map[string]interface{}{
		"type": "query",
	}
	
	// Merge options
	for k, v := range options {
		metadata[k] = v
	}
	
	msg := Message{
		Type:      MessageTypeCommand,
		ID:        generateMessageID(),
		Content:   query,
		Metadata:  metadata,
		Timestamp: time.Now(),
	}
	
	data, err := json.Marshal(msg)
	if err != nil {
		return err
	}
	
	_, err = b.stdin.Write(append(data, '\n'))
	return err
}

// ExecuteTool executes a tool
func (b *CLIBridge) ExecuteTool(tool string, params map[string]interface{}) error {
	msg := Message{
		Type:    MessageTypeTool,
		ID:      generateMessageID(),
		Content: tool,
		Metadata: map[string]interface{}{
			"params": params,
		},
		Timestamp: time.Now(),
	}
	
	data, err := json.Marshal(msg)
	if err != nil {
		return err
	}
	
	_, err = b.stdin.Write(append(data, '\n'))
	return err
}

// readLoop continuously reads responses from the CLI
func (b *CLIBridge) readLoop() {
	defer func() {
		b.mu.Lock()
		b.running = false
		b.mu.Unlock()
	}()
	
	for b.scanner.Scan() {
		line := b.scanner.Text()
		
		var msg Message
		if err := json.Unmarshal([]byte(line), &msg); err != nil {
			// Try to parse as plain response
			continue
		}
		
		// Handle message based on type
		switch msg.Type {
		case MessageTypeResponse:
			b.handleResponse(msg)
		case MessageTypeStream:
			b.handleStream(msg)
		case MessageTypeError:
			b.handleError(msg)
		case MessageTypeStatus:
			b.handleStatus(msg)
		}
	}
	
	if err := b.scanner.Err(); err != nil {
		fmt.Printf("Scanner error: %v\n", err)
	}
}

// handleResponse handles response messages
func (b *CLIBridge) handleResponse(msg Message) {
	b.mu.Lock()
	callback, exists := b.callbacks[msg.ID]
	if exists {
		delete(b.callbacks, msg.ID)
	}
	b.mu.Unlock()
	
	if callback != nil {
		var resp Response
		if msg.Metadata != nil {
			if data, ok := msg.Metadata["data"]; ok {
				resp.Data = data
				resp.Success = true
			}
		} else {
			resp.Data = msg.Content
			resp.Success = true
		}
		
		callback(resp)
	}
}

// handleStream handles streaming messages
func (b *CLIBridge) handleStream(msg Message) {
	// TODO: Implement streaming handler
	fmt.Printf("Stream: %s\n", msg.Content)
}

// handleError handles error messages
func (b *CLIBridge) handleError(msg Message) {
	fmt.Printf("Error: %s\n", msg.Content)
}

// handleStatus handles status messages
func (b *CLIBridge) handleStatus(msg Message) {
	// TODO: Implement status handler
	fmt.Printf("Status: %s\n", msg.Content)
}

// Close closes the CLI bridge
func (b *CLIBridge) Close() error {
	b.mu.Lock()
	defer b.mu.Unlock()
	
	if !b.running {
		return nil
	}
	
	b.running = false
	
	// Close pipes
	b.stdin.Close()
	b.stdout.Close()
	b.stderr.Close()
	
	// Kill process
	if err := b.cmd.Process.Kill(); err != nil {
		return fmt.Errorf("failed to kill process: %w", err)
	}
	
	// Wait for process to exit
	b.cmd.Wait()
	
	return nil
}

// IsRunning checks if the bridge is running
func (b *CLIBridge) IsRunning() bool {
	b.mu.Lock()
	defer b.mu.Unlock()
	return b.running
}

// generateMessageID generates a unique message ID
func generateMessageID() string {
	return fmt.Sprintf("msg-%d-%d", time.Now().UnixNano(), time.Now().Nanosecond())
}

