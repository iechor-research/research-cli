package ui

import (
	"github.com/charmbracelet/lipgloss"
)

// Styles contains all the styles for the application
type Styles struct {
	App               lipgloss.Style
	MessageArea       lipgloss.Style
	InputArea         lipgloss.Style
	Sidebar           lipgloss.Style
	UserMessage       lipgloss.Style
	AssistantMessage  lipgloss.Style
	SystemMessage     lipgloss.Style
	PanelTitle        lipgloss.Style
	StatusBarActive   lipgloss.Style
	StatusBarInactive lipgloss.Style
	Toolbar           lipgloss.Style
	ToolbarItem       lipgloss.Style
	ToolbarActive     lipgloss.Style
}

// DefaultStyles returns the default styles
func DefaultStyles() Styles {
	// Define colors
	primaryColor := lipgloss.Color("#7B61FF")   // Purple
	secondaryColor := lipgloss.Color("#00D9FF") // Cyan
	successColor := lipgloss.Color("#00FF88")   // Green
	warningColor := lipgloss.Color("#FFB800")   // Yellow
	bgColor := lipgloss.Color("#1A1B26")        // Dark background
	fgColor := lipgloss.Color("#C0CAF5")        // Light foreground
	borderColor := lipgloss.Color("#414868")    // Border

	return Styles{
		App: lipgloss.NewStyle().
			Background(bgColor).
			Foreground(fgColor).
			Padding(1),

		MessageArea: lipgloss.NewStyle().
			Border(lipgloss.RoundedBorder()).
			BorderForeground(borderColor).
			Padding(1).
			MarginBottom(1),

		InputArea: lipgloss.NewStyle().
			Border(lipgloss.RoundedBorder()).
			BorderForeground(primaryColor).
			Padding(0, 1),

		Sidebar: lipgloss.NewStyle().
			Border(lipgloss.RoundedBorder()).
			BorderForeground(borderColor).
			Padding(1).
			Width(40).
			MarginLeft(1),

		UserMessage: lipgloss.NewStyle().
			Foreground(secondaryColor).
			Bold(true).
			MarginBottom(1),

		AssistantMessage: lipgloss.NewStyle().
			Foreground(successColor).
			MarginBottom(1),

		SystemMessage: lipgloss.NewStyle().
			Foreground(warningColor).
			Italic(true).
			MarginBottom(1),

		PanelTitle: lipgloss.NewStyle().
			Foreground(primaryColor).
			Bold(true).
			MarginBottom(1).
			Underline(true),

		StatusBarActive: lipgloss.NewStyle().
			Background(primaryColor).
			Foreground(lipgloss.Color("#FFFFFF")).
			Padding(0, 1),

		StatusBarInactive: lipgloss.NewStyle().
			Background(borderColor).
			Foreground(fgColor).
			Padding(0, 1),

		Toolbar: lipgloss.NewStyle().
			Border(lipgloss.NormalBorder(), false, false, true, false).
			BorderForeground(borderColor).
			MarginBottom(1),

		ToolbarItem: lipgloss.NewStyle().
			Padding(0, 2).
			Foreground(fgColor),

		ToolbarActive: lipgloss.NewStyle().
			Padding(0, 2).
			Background(primaryColor).
			Foreground(lipgloss.Color("#FFFFFF")).
			Bold(true),
	}
}

// NeonStyles returns neon-themed styles
func NeonStyles() Styles {
	// Neon colors
	neonPink := lipgloss.Color("#FF10F0")
	neonBlue := lipgloss.Color("#00FFF0")
	neonGreen := lipgloss.Color("#39FF14")
	neonYellow := lipgloss.Color("#FFFF00")
	neonPurple := lipgloss.Color("#BC13FE")
	darkBg := lipgloss.Color("#0A0A0A")
	
	return Styles{
		App: lipgloss.NewStyle().
			Background(darkBg).
			Foreground(neonBlue),

		MessageArea: lipgloss.NewStyle().
			Border(lipgloss.DoubleBorder()).
			BorderForeground(neonPink).
			Padding(1),

		InputArea: lipgloss.NewStyle().
			Border(lipgloss.ThickBorder()).
			BorderForeground(neonGreen).
			Padding(0, 1),

		UserMessage: lipgloss.NewStyle().
			Foreground(neonYellow).
			Bold(true),

		AssistantMessage: lipgloss.NewStyle().
			Foreground(neonBlue),

		SystemMessage: lipgloss.NewStyle().
			Foreground(neonPurple).
			Italic(true),

		PanelTitle: lipgloss.NewStyle().
			Foreground(neonPink).
			Bold(true).
			Underline(true),

		Sidebar: lipgloss.NewStyle().
			Border(lipgloss.DoubleBorder()).
			BorderForeground(neonPurple).
			Padding(1),

		StatusBarActive: lipgloss.NewStyle().
			Background(neonPink).
			Foreground(darkBg).
			Bold(true),

		StatusBarInactive: lipgloss.NewStyle().
			Background(lipgloss.Color("#333333")).
			Foreground(neonBlue),

		Toolbar: lipgloss.NewStyle().
			Border(lipgloss.NormalBorder(), false, false, true, false).
			BorderForeground(neonGreen),

		ToolbarItem: lipgloss.NewStyle().
			Foreground(neonBlue),

		ToolbarActive: lipgloss.NewStyle().
			Background(neonGreen).
			Foreground(darkBg).
			Bold(true),
	}
}

// MinimalStyles returns minimal/clean styles
func MinimalStyles() Styles {
	bg := lipgloss.Color("#FFFFFF")
	fg := lipgloss.Color("#000000")
	accent := lipgloss.Color("#0066CC")
	gray := lipgloss.Color("#666666")
	lightGray := lipgloss.Color("#E0E0E0")
	
	return Styles{
		App: lipgloss.NewStyle().
			Background(bg).
			Foreground(fg),

		MessageArea: lipgloss.NewStyle().
			Border(lipgloss.NormalBorder()).
			BorderForeground(lightGray).
			Padding(1),

		InputArea: lipgloss.NewStyle().
			Border(lipgloss.NormalBorder()).
			BorderForeground(accent).
			Padding(0, 1),

		UserMessage: lipgloss.NewStyle().
			Foreground(accent).
			Bold(true),

		AssistantMessage: lipgloss.NewStyle().
			Foreground(fg),

		SystemMessage: lipgloss.NewStyle().
			Foreground(gray).
			Italic(true),

		PanelTitle: lipgloss.NewStyle().
			Foreground(accent).
			Bold(true),

		Sidebar: lipgloss.NewStyle().
			Border(lipgloss.NormalBorder()).
			BorderForeground(lightGray).
			Padding(1),

		StatusBarActive: lipgloss.NewStyle().
			Background(accent).
			Foreground(bg),

		StatusBarInactive: lipgloss.NewStyle().
			Background(lightGray).
			Foreground(gray),

		Toolbar: lipgloss.NewStyle().
			Border(lipgloss.NormalBorder(), false, false, true, false).
			BorderForeground(lightGray),

		ToolbarItem: lipgloss.NewStyle().
			Foreground(gray),

		ToolbarActive: lipgloss.NewStyle().
			Foreground(accent).
			Bold(true),
	}
}
