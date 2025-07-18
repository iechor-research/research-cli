import { useState, useEffect, useRef } from 'react'
import { Terminal } from 'lucide-react'

interface TerminalEntry {
  id: string
  type: 'input' | 'output' | 'error'
  content: string
  timestamp: Date
}

interface WebTerminalProps {
  onCommand?: (command: string) => Promise<string>
  isLoading?: boolean
  className?: string
}

export default function WebTerminal({ 
  onCommand, 
  isLoading = false, 
  className = '' 
}: WebTerminalProps) {
  const [entries, setEntries] = useState<TerminalEntry[]>([
    {
      id: '1',
      type: 'output',
      content: 'Welcome to Research CLI Web Terminal!\nType /help to see available commands.',
      timestamp: new Date()
    }
  ])
  const [currentInput, setCurrentInput] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const terminalRef = useRef<HTMLDivElement>(null)

  // 自动滚动到底部
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [entries])

  // 聚焦输入框
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  const addEntry = (type: TerminalEntry['type'], content: string) => {
    const newEntry: TerminalEntry = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date()
    }
    setEntries(prev => [...prev, newEntry])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentInput.trim() || isLoading) return

    const command = currentInput.trim()
    
    // 添加输入到历史记录
    setHistory(prev => [...prev, command])
    setHistoryIndex(-1)
    
    // 显示用户输入
    addEntry('input', `$ ${command}`)
    
    // 清空输入
    setCurrentInput('')

    try {
      // 处理内置命令
      if (command === '/help') {
        const helpText = `Available commands:
/help - Show this help message
/research search <query> - Search academic papers
/paper outline <topic> - Generate paper outline
/clear - Clear terminal
/version - Show version information

Examples:
/research search "machine learning"
/paper outline "Deep Learning for NLP"`
        addEntry('output', helpText)
        return
      }

      if (command === '/clear') {
        setEntries([])
        return
      }

      if (command === '/version') {
        addEntry('output', 'Research CLI Web Terminal v0.1.0')
        return
      }

      // 调用外部命令处理器
      if (onCommand) {
        const result = await onCommand(command)
        addEntry('output', result)
      } else {
        // 模拟命令执行
        if (command.startsWith('/research search')) {
          const query = command.replace('/research search', '').trim()
          addEntry('output', `Searching for papers about: ${query}\n\nFound 5 papers:\n1. "Machine Learning Advances" - Smith et al. (2024)\n2. "Deep Learning Applications" - Johnson et al. (2024)\n3. "AI in Research" - Brown et al. (2023)\n4. "Neural Networks Today" - Davis et al. (2024)\n5. "Future of ML" - Wilson et al. (2024)`)
        } else if (command.startsWith('/paper outline')) {
          const topic = command.replace('/paper outline', '').trim()
          addEntry('output', `Generated outline for: ${topic}\n\n1. Introduction\n   - Background and motivation\n   - Problem statement\n   - Contributions\n\n2. Related Work\n   - Previous approaches\n   - Limitations\n\n3. Methodology\n   - Proposed approach\n   - Implementation details\n\n4. Experiments\n   - Dataset description\n   - Experimental setup\n   - Results\n\n5. Discussion\n   - Analysis of results\n   - Limitations\n\n6. Conclusion\n   - Summary\n   - Future work`)
        } else {
          addEntry('error', `Unknown command: ${command}\nType /help for available commands.`)
        }
      }
    } catch (error) {
      addEntry('error', `Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (history.length > 0) {
        const newIndex = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1)
        setHistoryIndex(newIndex)
        setCurrentInput(history[newIndex])
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1
        if (newIndex >= history.length) {
          setHistoryIndex(-1)
          setCurrentInput('')
        } else {
          setHistoryIndex(newIndex)
          setCurrentInput(history[newIndex])
        }
      }
    }
  }

  return (
    <div className={`bg-surface-color border border-gray-700 rounded-lg overflow-hidden ${className}`}>
      {/* Terminal Header */}
      <div className="bg-gray-800 px-4 py-2 flex items-center gap-2 border-b border-gray-700">
        <Terminal className="w-4 h-4 text-gray-400" />
        <span className="text-sm text-gray-300">Research CLI Terminal</span>
        <div className="ml-auto flex gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        </div>
      </div>

      {/* Terminal Content */}
      <div 
        ref={terminalRef}
        className="p-4 h-96 overflow-y-auto font-mono text-sm bg-black text-green-400"
      >
        {entries.map((entry) => (
          <div key={entry.id} className="mb-2">
            {entry.type === 'input' && (
              <div className="text-cyan-400">{entry.content}</div>
            )}
            {entry.type === 'output' && (
              <div className="text-green-400 whitespace-pre-wrap">{entry.content}</div>
            )}
            {entry.type === 'error' && (
              <div className="text-red-400 whitespace-pre-wrap">{entry.content}</div>
            )}
          </div>
        ))}
        
        {/* Input Line */}
        <form onSubmit={handleSubmit} className="flex items-center">
          <span className="text-cyan-400 mr-2">$</span>
          <input
            ref={inputRef}
            type="text"
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            className="flex-1 bg-transparent border-none outline-none text-green-400 font-mono"
            placeholder={isLoading ? "Processing..." : "Type a command..."}
          />
        </form>
      </div>
    </div>
  )
} 