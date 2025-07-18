import Head from 'next/head'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import { Search, FileText, BookOpen, Send, BarChart3, Terminal } from 'lucide-react'

export default function ResearchPage() {
  const tools = [
    {
      icon: <Search className="w-12 h-12 text-blue-500" />,
      title: "Literature Search",
      description: "Search academic papers from arXiv, PubMed, IEEE, and other databases with AI-powered relevance ranking.",
      href: "/research/search",
      color: "bg-blue-500/10 border-blue-500/20"
    },
    {
      icon: <FileText className="w-12 h-12 text-green-500" />,
      title: "Paper Outline Generator",
      description: "Generate structured outlines for research papers, reviews, and case studies with customizable templates.",
      href: "/research/outline",
      color: "bg-green-500/10 border-green-500/20"
    },
    {
      icon: <BookOpen className="w-12 h-12 text-purple-500" />,
      title: "Bibliography Manager",
      description: "Organize references with BibTeX support, citation network analysis, and automatic formatting.",
      href: "/research/bibliography",
      color: "bg-purple-500/10 border-purple-500/20"
    },
    {
      icon: <BarChart3 className="w-12 h-12 text-orange-500" />,
      title: "Data Analysis",
      description: "Statistical analysis, machine learning tools, and data visualization for research projects.",
      href: "/research/analysis",
      color: "bg-orange-500/10 border-orange-500/20"
    },
    {
      icon: <Send className="w-12 h-12 text-red-500" />,
      title: "Journal Submission",
      description: "Find suitable journals and prepare submission packages with automated formatting and templates.",
      href: "/research/submission",
      color: "bg-red-500/10 border-red-500/20"
    },
    {
      icon: <Terminal className="w-12 h-12 text-cyan-500" />,
      title: "Command Interface",
      description: "Access all research tools through a powerful command-line interface with autocomplete and history.",
      href: "/terminal",
      color: "bg-cyan-500/10 border-cyan-500/20"
    }
  ]

  return (
    <>
      <Head>
        <title>Research Tools - Research CLI</title>
        <meta name="description" content="Comprehensive academic research tools for literature search, paper writing, and journal submission." />
      </Head>

      <div className="min-h-screen gradient-bg">
        <Header />
        
        <main className="container py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">
              Research Tools
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Comprehensive suite of AI-powered tools for academic research, 
              from literature discovery to journal submission.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {tools.map((tool, index) => (
              <Link
                key={index}
                href={tool.href}
                className={`glass p-6 rounded-xl hover:bg-surface-color transition-all duration-300 border ${tool.color} group`}
              >
                <div className="mb-4 group-hover:scale-110 transition-transform duration-300">
                  {tool.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{tool.title}</h3>
                <p className="text-gray-400 leading-relaxed">{tool.description}</p>
              </Link>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="glass p-8 rounded-xl">
            <h2 className="text-2xl font-bold mb-6 text-center">
              Quick Actions
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link
                href="/research/search"
                className="bg-blue-600 text-white p-4 rounded-lg text-center hover:bg-blue-700 transition-colors"
              >
                <Search className="w-6 h-6 mx-auto mb-2" />
                <div className="font-medium">Search Papers</div>
              </Link>
              <Link
                href="/research/outline"
                className="bg-green-600 text-white p-4 rounded-lg text-center hover:bg-green-700 transition-colors"
              >
                <FileText className="w-6 h-6 mx-auto mb-2" />
                <div className="font-medium">Generate Outline</div>
              </Link>
              <Link
                href="/research/bibliography"
                className="bg-purple-600 text-white p-4 rounded-lg text-center hover:bg-purple-700 transition-colors"
              >
                <BookOpen className="w-6 h-6 mx-auto mb-2" />
                <div className="font-medium">Manage References</div>
              </Link>
              <Link
                href="/terminal"
                className="bg-cyan-600 text-white p-4 rounded-lg text-center hover:bg-cyan-700 transition-colors"
              >
                <Terminal className="w-6 h-6 mx-auto mb-2" />
                <div className="font-medium">Open Terminal</div>
              </Link>
            </div>
          </div>

          {/* Getting Started */}
          <div className="mt-12 grid md:grid-cols-2 gap-8">
            <div className="glass p-6 rounded-xl">
              <h3 className="text-xl font-semibold mb-4">Getting Started</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold">1</div>
                  <div>
                    <div className="font-medium">Choose Your Tool</div>
                    <div className="text-gray-400">Select the research tool that matches your current needs</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold">2</div>
                  <div>
                    <div className="font-medium">Input Your Query</div>
                    <div className="text-gray-400">Enter your research topic, keywords, or requirements</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold">3</div>
                  <div>
                    <div className="font-medium">Get AI-Powered Results</div>
                    <div className="text-gray-400">Receive intelligent, relevant results tailored to your research</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass p-6 rounded-xl">
              <h3 className="text-xl font-semibold mb-4">Popular Workflows</h3>
              <div className="space-y-3 text-sm">
                <div className="p-3 bg-surface-color rounded-lg">
                  <div className="font-medium">Literature Review</div>
                  <div className="text-gray-400">Search → Organize → Analyze → Write</div>
                </div>
                <div className="p-3 bg-surface-color rounded-lg">
                  <div className="font-medium">Paper Writing</div>
                  <div className="text-gray-400">Outline → Research → Write → Format</div>
                </div>
                <div className="p-3 bg-surface-color rounded-lg">
                  <div className="font-medium">Journal Submission</div>
                  <div className="text-gray-400">Match → Prepare → Format → Submit</div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  )
} 