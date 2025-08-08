package ui

import (
	"fmt"
	"strings"

	"github.com/charmbracelet/bubbles/spinner"
	"github.com/charmbracelet/bubbles/textarea"
	"github.com/charmbracelet/bubbles/viewport"
	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"
)

// Pane represents different UI panels
type Pane int

const (
	PaneChat Pane = iota
	PaneConfig
	PaneDocs
	PaneTools
)

// Model represents the main application state
type Model struct {
	// Window dimensions
	width  int
	height int

	// UI components
	input     textarea.Model
	viewport  viewport.Model
	spinner   spinner.Model
	statusBar StatusBar
	toolbar   Toolbar

	// State
	messages    []Message
	activePane  Pane
	sidebarOpen bool
	loading     bool
	err         error

	// Configuration
	config *Config

	// Styles
	styles Styles
}

// Message represents a chat message
type Message struct {
	Role    string // "user", "assistant", "system"
	Content string
	Time    string
}

// NewModel creates a new application model
func NewModel(config *Config) Model {
	// Initialize input area
	ta := textarea.New()
	ta.Placeholder = "Type your message... (Ctrl+Enter to send)"
	ta.CharLimit = 0
	ta.SetHeight(3)
	ta.SetWidth(80)
	ta.Focus()

	// Initialize viewport for messages
	vp := viewport.New(80, 20)
	vp.SetContent("Welcome to Research Terminal!\nType /help for available commands.\n")

	// Initialize spinner
	s := spinner.New()
	s.Spinner = spinner.Dot
	s.Style = lipgloss.NewStyle().Foreground(lipgloss.Color("205"))

	// Initialize styles
	styles := DefaultStyles()

	return Model{
		input:      ta,
		viewport:   vp,
		spinner:    s,
		statusBar:  NewStatusBar(),
		toolbar:    NewToolbar(),
		messages:   []Message{},
		activePane: PaneChat,
		config:     config,
		styles:     styles,
	}
}

// Init initializes the model
func (m Model) Init() tea.Cmd {
	return tea.Batch(
		m.spinner.Tick,
		textarea.Blink,
	)
}

// Update handles messages
func (m Model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	var cmds []tea.Cmd

	switch msg := msg.(type) {
	case tea.WindowSizeMsg:
		m.width = msg.Width
		m.height = msg.Height
		m.updateLayout()

	case tea.KeyMsg:
		switch msg.Type {
		case tea.KeyCtrlC, tea.KeyEsc:
			return m, tea.Quit

		case tea.KeyCtrlK:
			// 打开配置面板
			m.activePane = PaneConfig
			m.sidebarOpen = true

		case tea.KeyCtrlD:
			// 打开文档面板
			m.activePane = PaneDocs
			m.sidebarOpen = true

		case tea.KeyCtrlT:
			// 打开工具面板
			m.activePane = PaneTools
			m.sidebarOpen = true

		case tea.KeyCtrlB:
			// 切换侧边栏
			m.sidebarOpen = !m.sidebarOpen

		case tea.KeyEnter:
			if msg.Alt {
				// Alt+Enter 在输入框中换行
				var cmd tea.Cmd
				m.input, cmd = m.input.Update(msg)
				cmds = append(cmds, cmd)
			} else if strings.HasPrefix(m.input.Value(), "/") {
				// 处理命令
				m.handleCommand(m.input.Value())
				m.input.SetValue("")
			}



		default:
			// 更新输入框
			var cmd tea.Cmd
			m.input, cmd = m.input.Update(msg)
			cmds = append(cmds, cmd)
		}

	case spinner.TickMsg:
		if m.loading {
			var cmd tea.Cmd
			m.spinner, cmd = m.spinner.Update(msg)
			cmds = append(cmds, cmd)
		}

	default:
		// 更新子组件
		var cmd tea.Cmd
		m.viewport, cmd = m.viewport.Update(msg)
		cmds = append(cmds, cmd)
	}

	return m, tea.Batch(cmds...)
}

// View renders the UI
func (m Model) View() string {
	if m.width == 0 || m.height == 0 {
		return "Initializing..."
	}

	// 构建主要内容区域
	mainContent := m.renderMainContent()

	// 如果侧边栏打开，显示侧边栏
	if m.sidebarOpen {
		sidebar := m.renderSidebar()
		return lipgloss.JoinHorizontal(
			lipgloss.Left,
			mainContent,
			sidebar,
		)
	}

	return mainContent
}

// renderMainContent 渲染主要内容区域
func (m Model) renderMainContent() string {
	// 工具栏
	toolbar := m.toolbar.View()

	// 消息区域
	messagesView := m.renderMessages()

	// 输入区域
	inputView := m.renderInput()

	// 状态栏
	statusBar := m.statusBar.View()

	// 组合所有部分
	content := lipgloss.JoinVertical(
		lipgloss.Top,
		toolbar,
		messagesView,
		inputView,
		statusBar,
	)

	return m.styles.App.Render(content)
}

// renderMessages 渲染消息区域
func (m Model) renderMessages() string {
	var content strings.Builder

	for _, msg := range m.messages {
		switch msg.Role {
		case "user":
			content.WriteString(m.styles.UserMessage.Render("You: " + msg.Content))
		case "assistant":
			content.WriteString(m.styles.AssistantMessage.Render("AI: " + msg.Content))
		case "system":
			content.WriteString(m.styles.SystemMessage.Render("System: " + msg.Content))
		}
		content.WriteString("\n")
	}

	m.viewport.SetContent(content.String())
	return m.styles.MessageArea.Render(m.viewport.View())
}

// renderInput 渲染输入区域
func (m Model) renderInput() string {
	input := m.input.View()
	
	if m.loading {
		input = lipgloss.JoinHorizontal(
			lipgloss.Left,
			input,
			" ",
			m.spinner.View(),
		)
	}

	return m.styles.InputArea.Render(input)
}

// renderSidebar 渲染侧边栏
func (m Model) renderSidebar() string {
	var content string

	switch m.activePane {
	case PaneConfig:
		content = m.renderConfigPanel()
	case PaneDocs:
		content = m.renderDocsPanel()
	case PaneTools:
		content = m.renderToolsPanel()
	default:
		content = "No panel selected"
	}

	return m.styles.Sidebar.Render(content)
}

// renderConfigPanel 渲染配置面板
func (m Model) renderConfigPanel() string {
	title := m.styles.PanelTitle.Render("⚙️  Configuration")
	
	content := fmt.Sprintf(`
Provider: %s
Model: %s
Theme: %s

Press Ctrl+B to close
`, m.config.AI.Provider, m.config.AI.Model, m.config.Theme.Name)

	return lipgloss.JoinVertical(
		lipgloss.Top,
		title,
		content,
	)
}

// renderDocsPanel 渲染文档面板
func (m Model) renderDocsPanel() string {
	title := m.styles.PanelTitle.Render("📚 Documentation")
	
	content := `
Available Commands:
- /help - Show help
- /config - Open configuration
- /docs - Show documentation
- /clear - Clear messages
- /model <name> - Switch model
- /theme <name> - Switch theme

Press Ctrl+B to close
`

	return lipgloss.JoinVertical(
		lipgloss.Top,
		title,
		content,
	)
}

// renderToolsPanel 渲染工具面板
func (m Model) renderToolsPanel() string {
	title := m.styles.PanelTitle.Render("🔧 Tools")
	
	content := `
Available Tools:
- File Operations
- Web Search
- Code Analysis
- Data Processing

Press Ctrl+B to close
`

	return lipgloss.JoinVertical(
		lipgloss.Top,
		title,
		content,
	)
}

// updateLayout 更新布局尺寸
func (m *Model) updateLayout() {
	// 计算各部分的尺寸
	toolbarHeight := 3
	statusBarHeight := 1
	inputHeight := 3
	
	// 计算消息区域的高度
	messageHeight := m.height - toolbarHeight - statusBarHeight - inputHeight - 2
	
	// 计算宽度
	width := m.width
	if m.sidebarOpen {
		width = m.width * 2 / 3 // 主区域占 2/3
	}
	
	// 更新组件尺寸
	m.viewport.Width = width - 2
	m.viewport.Height = messageHeight
	m.input.SetWidth(width - 2)
}

// handleCommand 处理命令
func (m *Model) handleCommand(cmd string) {
	parts := strings.Fields(cmd)
	if len(parts) == 0 {
		return
	}

	switch parts[0] {
	case "/help":
		m.messages = append(m.messages, Message{
			Role:    "system",
			Content: "Available commands: /help, /config, /docs, /clear, /model, /theme",
		})
	case "/clear":
		m.messages = []Message{}
	case "/config":
		m.activePane = PaneConfig
		m.sidebarOpen = true
	case "/docs":
		m.activePane = PaneDocs
		m.sidebarOpen = true
	case "/model":
		if len(parts) > 1 {
			m.config.AI.Model = parts[1]
			m.messages = append(m.messages, Message{
				Role:    "system",
				Content: fmt.Sprintf("Model switched to: %s", parts[1]),
			})
		}
	case "/theme":
		if len(parts) > 1 {
			m.config.Theme.Name = parts[1]
			m.messages = append(m.messages, Message{
				Role:    "system",
				Content: fmt.Sprintf("Theme switched to: %s", parts[1]),
			})
		}
	default:
		m.messages = append(m.messages, Message{
			Role:    "system",
			Content: fmt.Sprintf("Unknown command: %s", parts[0]),
		})
	}
}

// sendMessage 发送消息
func (m *Model) sendMessage(content string) {
	// 添加用户消息
	m.messages = append(m.messages, Message{
		Role:    "user",
		Content: content,
	})

	// TODO: 调用 AI API
	m.loading = true
	
	// 模拟 AI 响应
	m.messages = append(m.messages, Message{
		Role:    "assistant",
		Content: "This is a simulated response. Integration with Research CLI coming soon!",
	})
	
	m.loading = false
}
