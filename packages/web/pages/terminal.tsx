import Head from 'next/head'
import Header from '@/components/layout/Header'
import WebTerminal from '@/components/terminal/WebTerminal'

export default function TerminalPage() {
  const handleCommand = async (command: string): Promise<string> => {
    // 这里可以调用实际的 CLI 核心功能
    // 暂时返回模拟响应
    return `Executed: ${command}\nThis is a placeholder response.`
  }

  return (
    <>
      <Head>
        <title>Terminal - Research CLI</title>
        <meta name="description" content="Interactive web terminal for Research CLI" />
      </Head>

      <div className="min-h-screen gradient-bg">
        <Header />
        
        <main className="container py-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-center">
              Research CLI Web Terminal
            </h1>
            <p className="text-gray-400 text-center mb-8">
              Access all Research CLI features through this interactive web terminal
            </p>
            
            <WebTerminal 
              onCommand={handleCommand}
              className="mx-auto"
            />
            
            <div className="mt-8 grid md:grid-cols-2 gap-6">
              <div className="glass p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Quick Commands</h3>
                <div className="space-y-2 text-sm">
                  <div><code>/help</code> - Show available commands</div>
                  <div><code>/research search "query"</code> - Search papers</div>
                  <div><code>/paper outline "topic"</code> - Generate outline</div>
                  <div><code>/clear</code> - Clear terminal</div>
                </div>
              </div>
              
              <div className="glass p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Tips</h3>
                <div className="space-y-2 text-sm text-gray-400">
                  <div>• Use ↑/↓ arrow keys to navigate command history</div>
                  <div>• Commands are case-sensitive</div>
                  <div>• Use quotes for multi-word arguments</div>
                  <div>• Type /help for detailed command reference</div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  )
} 