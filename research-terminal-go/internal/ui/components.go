package ui

import (
	"fmt"
	"strings"
	"time"

	"github.com/charmbracelet/lipgloss"
)

// StatusBar represents the status bar component
type StatusBar struct {
	model      string
	provider   string
	connected  bool
	lastUpdate time.Time
	styles     Styles
}

// NewStatusBar creates a new status bar
func NewStatusBar() StatusBar {
	return StatusBar{
		model:      "gpt-4",
		provider:   "openai",
		connected:  true,
		lastUpdate: time.Now(),
		styles:     DefaultStyles(),
	}
}

// View renders the status bar
func (s StatusBar) View() string {
	var items []string

	// Connection status
	connStatus := "●"
	connStyle := s.styles.StatusBarActive
	if !s.connected {
		connStatus = "○"
		connStyle = s.styles.StatusBarInactive
	}
	items = append(items, connStyle.Render(connStatus))

	// Model and provider
	modelInfo := fmt.Sprintf("%s/%s", s.provider, s.model)
	items = append(items, s.styles.StatusBarInactive.Render(modelInfo))

	// Time
	timeStr := s.lastUpdate.Format("15:04:05")
	items = append(items, s.styles.StatusBarInactive.Render(timeStr))

	// Memory usage (placeholder)
	memUsage := "Mem: 42MB"
	items = append(items, s.styles.StatusBarInactive.Render(memUsage))

	return lipgloss.JoinHorizontal(
		lipgloss.Left,
		items...,
	)
}

// Update updates the status bar state
func (s *StatusBar) Update(model, provider string, connected bool) {
	s.model = model
	s.provider = provider
	s.connected = connected
	s.lastUpdate = time.Now()
}

// Toolbar represents the toolbar component
type Toolbar struct {
	items      []ToolbarItem
	activeItem int
	styles     Styles
}

// ToolbarItem represents a toolbar item
type ToolbarItem struct {
	Label    string
	Icon     string
	Shortcut string
	Action   func()
}

// NewToolbar creates a new toolbar
func NewToolbar() Toolbar {
	return Toolbar{
		items: []ToolbarItem{
			{Icon: "💬", Label: "Chat", Shortcut: "Ctrl+1"},
			{Icon: "⚙️", Label: "Config", Shortcut: "Ctrl+K"},
			{Icon: "📚", Label: "Docs", Shortcut: "Ctrl+D"},
			{Icon: "🔧", Label: "Tools", Shortcut: "Ctrl+T"},
			{Icon: "📝", Label: "Session", Shortcut: "Ctrl+N"},
			{Icon: "❓", Label: "Help", Shortcut: "F1"},
		},
		activeItem: 0,
		styles:     DefaultStyles(),
	}
}

// View renders the toolbar
func (t Toolbar) View() string {
	var items []string

	for i, item := range t.items {
		label := fmt.Sprintf("%s %s", item.Icon, item.Label)
		
		style := t.styles.ToolbarItem
		if i == t.activeItem {
			style = t.styles.ToolbarActive
		}
		
		items = append(items, style.Render(label))
	}

	toolbar := lipgloss.JoinHorizontal(
		lipgloss.Left,
		items...,
	)

	// Add title
	title := lipgloss.NewStyle().
		Bold(true).
		Foreground(lipgloss.Color("#7B61FF")).
		Render("🚀 Research Terminal")

	// Add shortcuts hint
	shortcuts := lipgloss.NewStyle().
		Foreground(lipgloss.Color("#666666")).
		Render("Press F1 for help")

	// Combine all parts
	width := 80 // Default width, should be dynamic
	spacer := strings.Repeat(" ", width-lipgloss.Width(title)-lipgloss.Width(shortcuts)-2)
	
	header := lipgloss.JoinHorizontal(
		lipgloss.Left,
		title,
		spacer,
		shortcuts,
	)

	return lipgloss.JoinVertical(
		lipgloss.Top,
		header,
		toolbar,
	)
}

// SetActive sets the active toolbar item
func (t *Toolbar) SetActive(index int) {
	if index >= 0 && index < len(t.items) {
		t.activeItem = index
	}
}

// SessionInfo represents session information
type SessionInfo struct {
	ID         string
	StartTime  time.Time
	Messages   int
	TokensUsed int
}

// NewSessionInfo creates new session info
func NewSessionInfo() SessionInfo {
	return SessionInfo{
		ID:         generateSessionID(),
		StartTime:  time.Now(),
		Messages:   0,
		TokensUsed: 0,
	}
}

// View renders session info
func (s SessionInfo) View() string {
	duration := time.Since(s.StartTime)
	
	info := fmt.Sprintf(
		"Session: %s | Duration: %s | Messages: %d | Tokens: %d",
		s.ID,
		formatDuration(duration),
		s.Messages,
		s.TokensUsed,
	)
	
	return lipgloss.NewStyle().
		Foreground(lipgloss.Color("#666666")).
		Italic(true).
		Render(info)
}

// Helper functions

func generateSessionID() string {
	return fmt.Sprintf("session-%d", time.Now().Unix())
}

func formatDuration(d time.Duration) string {
	if d < time.Minute {
		return fmt.Sprintf("%ds", int(d.Seconds()))
	}
	if d < time.Hour {
		return fmt.Sprintf("%dm", int(d.Minutes()))
	}
	return fmt.Sprintf("%dh%dm", int(d.Hours()), int(d.Minutes())%60)
}

// QuickAction represents a quick action button
type QuickAction struct {
	Label   string
	Icon    string
	Command string
	Color   lipgloss.Color
}

// QuickActions represents a collection of quick actions
type QuickActions struct {
	actions []QuickAction
	styles  Styles
}

// NewQuickActions creates new quick actions
func NewQuickActions() QuickActions {
	return QuickActions{
		actions: []QuickAction{
			{Icon: "🔍", Label: "Search", Command: "/search", Color: lipgloss.Color("#00D9FF")},
			{Icon: "📁", Label: "Files", Command: "/files", Color: lipgloss.Color("#00FF88")},
			{Icon: "🌐", Label: "Web", Command: "/web", Color: lipgloss.Color("#FFB800")},
			{Icon: "💾", Label: "Save", Command: "/save", Color: lipgloss.Color("#FF3366")},
			{Icon: "📤", Label: "Export", Command: "/export", Color: lipgloss.Color("#7B61FF")},
		},
		styles: DefaultStyles(),
	}
}

// View renders quick actions
func (q QuickActions) View() string {
	var buttons []string
	
	for _, action := range q.actions {
		button := lipgloss.NewStyle().
			Padding(0, 1).
			Background(action.Color).
			Foreground(lipgloss.Color("#FFFFFF")).
			Bold(true).
			Render(fmt.Sprintf("%s %s", action.Icon, action.Label))
		
		buttons = append(buttons, button)
	}
	
	return lipgloss.JoinHorizontal(
		lipgloss.Left,
		buttons...,
	)
}

