import Link from 'next/link'
import { useState } from 'react'
import { Search, Menu, X } from 'lucide-react'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <header className="glass sticky top-0 z-50 border-b border-gray-800">
      <div className="container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <span className="text-xl font-bold">Research CLI</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm hover:text-accent-color transition-colors">
              Home
            </Link>
            <Link href="/research" className="text-sm hover:text-accent-color transition-colors">
              Research
            </Link>
            <Link href="/terminal" className="text-sm hover:text-accent-color transition-colors">
              Terminal
            </Link>
            <Link href="/docs" className="text-sm hover:text-accent-color transition-colors">
              Docs
            </Link>
          </nav>

          {/* Search & Actions */}
          <div className="hidden md:flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search papers..."
                className="pl-10 pr-4 py-2 bg-surface-color border border-gray-700 rounded-lg text-sm focus:border-primary-color focus:outline-none w-64"
              />
            </div>
            <Link
              href="/research"
              className="bg-primary-color text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-lg hover:bg-surface-color transition-colors"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-800">
            <nav className="flex flex-col gap-4">
              <Link href="/" className="text-sm hover:text-accent-color transition-colors">
                Home
              </Link>
              <Link href="/research" className="text-sm hover:text-accent-color transition-colors">
                Research
              </Link>
              <Link href="/terminal" className="text-sm hover:text-accent-color transition-colors">
                Terminal
              </Link>
              <Link href="/docs" className="text-sm hover:text-accent-color transition-colors">
                Docs
              </Link>
              <div className="pt-4 border-t border-gray-800">
                <input
                  type="text"
                  placeholder="Search papers..."
                  className="w-full px-4 py-2 bg-surface-color border border-gray-700 rounded-lg text-sm focus:border-primary-color focus:outline-none"
                />
                <Link
                  href="/research"
                  className="block w-full bg-primary-color text-white text-center px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors mt-4"
                >
                  Get Started
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
} 