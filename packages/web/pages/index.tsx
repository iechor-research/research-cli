import Head from 'next/head'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import { Search, FileText, BarChart3, Send, Terminal, BookOpen } from 'lucide-react'

export default function Home() {
  const features = [
    {
      icon: <Search className="w-8 h-8 text-blue-500" />,
      title: "Smart Literature Search",
      description: "Search arXiv, PubMed, IEEE databases with AI-powered relevance ranking"
    },
    {
      icon: <FileText className="w-8 h-8 text-green-500" />,
      title: "AI Writing Assistant",
      description: "Generate paper outlines, improve writing style, and format citations automatically"
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-purple-500" />,
      title: "Data Analysis",
      description: "Statistical analysis, machine learning, and visualization tools for research"
    },
    {
      icon: <Send className="w-8 h-8 text-red-500" />,
      title: "Journal Submission",
      description: "Find suitable journals and prepare submission packages automatically"
    },
    {
      icon: <Terminal className="w-8 h-8 text-yellow-500" />,
      title: "Web Terminal",
      description: "Access all CLI features through an intuitive web interface"
    },
    {
      icon: <BookOpen className="w-8 h-8 text-cyan-500" />,
      title: "Bibliography Manager",
      description: "Organize references with BibTeX support and citation network analysis"
    }
  ]

  return (
    <>
      <Head>
        <title>Research CLI - Academic Research Made Simple</title>
        <meta name="description" content="A comprehensive academic research tool with AI-powered features for literature search, paper writing, and journal submission." />
        <meta property="og:title" content="Research CLI - Academic Research Made Simple" />
        <meta property="og:description" content="A comprehensive academic research tool with AI-powered features for literature search, paper writing, and journal submission." />
        <meta property="og:url" content="https://research-cli.iechor.com" />
      </Head>

      <div className="min-h-screen gradient-bg">
        <Header />
        
        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="container text-center">
            <div className="animate-fade-in">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Academic Research
                <br />
                <span className="bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
                  Made Simple
                </span>
              </h1>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                A comprehensive research tool that combines AI-powered literature search, 
                intelligent writing assistance, and automated submission preparation.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/research"
                  className="bg-primary-color text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors"
                >
                  Start Research
                </Link>
                <Link
                  href="/terminal"
                  className="bg-surface-color text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors border border-gray-700"
                >
                  Open Terminal
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4">
          <div className="container">
            <h2 className="text-3xl font-bold text-center mb-12">
              Everything You Need for Academic Research
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="glass p-6 rounded-xl hover:bg-surface-color transition-colors animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Quick Start Section */}
        <section className="py-20 px-4">
          <div className="container">
            <div className="glass p-8 rounded-xl max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-8">
                Quick Start
              </h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold mb-4">Command Line</h3>
                  <pre className="bg-surface-color p-4 rounded-lg text-sm overflow-x-auto">
                    <code>{`# Install Research CLI
npm install -g @iechor/research-cli

# Start the CLI
research

# Search for papers
/research search "machine learning"

# Generate paper outline
/paper outline "AI Safety"`}</code>
                  </pre>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-4">Web Interface</h3>
                  <div className="space-y-3">
                    <Link
                      href="/research/search"
                      className="block p-3 bg-surface-color rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      📄 Search Academic Papers
                    </Link>
                    <Link
                      href="/research/outline"
                      className="block p-3 bg-surface-color rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      📝 Generate Paper Outline
                    </Link>
                    <Link
                      href="/research/bibliography"
                      className="block p-3 bg-surface-color rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      📚 Manage Bibliography
                    </Link>
                    <Link
                      href="/terminal"
                      className="block p-3 bg-surface-color rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      💻 Open Web Terminal
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-4 border-t border-gray-800">
          <div className="container text-center">
            <p className="text-gray-400">
              © 2024 Research CLI. Built with ❤️ for researchers worldwide.
            </p>
          </div>
        </footer>
      </div>
    </>
  )
} 