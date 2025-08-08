package ui

import (
	"encoding/json"
	"os"
	"path/filepath"
)

// Config represents the application configuration
type Config struct {
	Theme     ThemeConfig     `json:"theme"`
	AI        AIConfig        `json:"ai"`
	Tools     ToolsConfig     `json:"tools"`
	Shortcuts ShortcutsConfig `json:"shortcuts"`
}

// ThemeConfig represents theme configuration
type ThemeConfig struct {
	Name        string `json:"name"`
	ColorScheme string `json:"colorScheme"`
	FontFamily  string `json:"fontFamily"`
	FontSize    int    `json:"fontSize"`
}

// AIConfig represents AI configuration
type AIConfig struct {
	Provider  string            `json:"provider"`
	Model     string            `json:"model"`
	APIKeys   map[string]string `json:"apiKeys"`
	MaxTokens int               `json:"maxTokens"`
	Stream    bool              `json:"stream"`
}

// ToolsConfig represents tools configuration
type ToolsConfig struct {
	Enabled      []string          `json:"enabled"`
	MCPServers   []MCPServerConfig `json:"mcpServers"`
	CustomTools  []CustomTool      `json:"customTools"`
	AutoApprove  []string          `json:"autoApprove"`
}

// MCPServerConfig represents MCP server configuration
type MCPServerConfig struct {
	Name    string            `json:"name"`
	URL     string            `json:"url"`
	Headers map[string]string `json:"headers"`
	Timeout int               `json:"timeout"`
}

// CustomTool represents a custom tool configuration
type CustomTool struct {
	Name        string   `json:"name"`
	Command     string   `json:"command"`
	Args        []string `json:"args"`
	Description string   `json:"description"`
}

// ShortcutsConfig represents keyboard shortcuts configuration
type ShortcutsConfig struct {
	SendMessage   string `json:"sendMessage"`
	ClearChat     string `json:"clearChat"`
	OpenConfig    string `json:"openConfig"`
	OpenDocs      string `json:"openDocs"`
	OpenTools     string `json:"openTools"`
	ToggleSidebar string `json:"toggleSidebar"`
	SwitchModel   string `json:"switchModel"`
	NewSession    string `json:"newSession"`
}

// DefaultConfig returns the default configuration
func DefaultConfig() *Config {
	return &Config{
		Theme: ThemeConfig{
			Name:        "default",
			ColorScheme: "dark",
			FontFamily:  "JetBrains Mono",
			FontSize:    14,
		},
		AI: AIConfig{
			Provider: "openai",
			Model:    "gpt-4",
			APIKeys: map[string]string{
				"openai":    "",
				"anthropic": "",
				"google":    "",
			},
			MaxTokens: 4096,
			Stream:    true,
		},
		Tools: ToolsConfig{
			Enabled: []string{
				"file_read",
				"file_write",
				"web_search",
				"shell_execute",
			},
			MCPServers:  []MCPServerConfig{},
			CustomTools: []CustomTool{},
			AutoApprove: []string{
				"file_read",
				"web_search",
			},
		},
		Shortcuts: ShortcutsConfig{
			SendMessage:   "ctrl+enter",
			ClearChat:     "ctrl+l",
			OpenConfig:    "ctrl+k",
			OpenDocs:      "ctrl+d",
			OpenTools:     "ctrl+t",
			ToggleSidebar: "ctrl+b",
			SwitchModel:   "ctrl+m",
			NewSession:    "ctrl+n",
		},
	}
}

// LoadConfig loads configuration from file
func LoadConfig() (*Config, error) {
	home, err := os.UserHomeDir()
	if err != nil {
		return nil, err
	}

	configPath := filepath.Join(home, ".research-terminal", "config.json")

	// Check if config file exists
	if _, err := os.Stat(configPath); os.IsNotExist(err) {
		// Create default config
		config := DefaultConfig()
		if err := SaveConfig(config); err != nil {
			return config, err
		}
		return config, nil
	}

	// Read config file
	data, err := os.ReadFile(configPath)
	if err != nil {
		return nil, err
	}

	// Parse config
	var config Config
	if err := json.Unmarshal(data, &config); err != nil {
		return nil, err
	}

	return &config, nil
}

// SaveConfig saves configuration to file
func SaveConfig(config *Config) error {
	home, err := os.UserHomeDir()
	if err != nil {
		return err
	}

	configDir := filepath.Join(home, ".research-terminal")
	configPath := filepath.Join(configDir, "config.json")

	// Create config directory if it doesn't exist
	if err := os.MkdirAll(configDir, 0755); err != nil {
		return err
	}

	// Marshal config to JSON
	data, err := json.MarshalIndent(config, "", "  ")
	if err != nil {
		return err
	}

	// Write config file
	return os.WriteFile(configPath, data, 0644)
}

// GetConfigPath returns the configuration file path
func GetConfigPath() (string, error) {
	home, err := os.UserHomeDir()
	if err != nil {
		return "", err
	}
	return filepath.Join(home, ".research-terminal", "config.json"), nil
}

