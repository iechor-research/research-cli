package main

import (
	"fmt"
	"log"
	"os"

	tea "github.com/charmbracelet/bubbletea"
	"github.com/iechor/research-terminal-go/internal/ui"
)

func main() {
	// 初始化配置
	config, err := ui.LoadConfig()
	if err != nil {
		log.Printf("Warning: Could not load config: %v", err)
		config = ui.DefaultConfig()
	}

	// 创建应用模型
	model := ui.NewModel(config)

	// 创建 Bubble Tea 程序
	p := tea.NewProgram(
		model,
		tea.WithAltScreen(),       // 使用备用屏幕缓冲区
		tea.WithMouseCellMotion(), // 启用鼠标支持
	)

	// 运行程序
	if _, err := p.Run(); err != nil {
		fmt.Printf("Error running program: %v\n", err)
		os.Exit(1)
	}
}

