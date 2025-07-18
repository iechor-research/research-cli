import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { useState, useEffect } from 'react'
import { ResearchContext } from '@/lib/research-context'

export default function App({ Component, pageProps }: AppProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [researchData, setResearchData] = useState(null)

  // 页面加载状态管理
  useEffect(() => {
    const handleStart = () => setIsLoading(true)
    const handleComplete = () => setIsLoading(false)

    // 监听路由变化
    const { Router } = require('next/router')
    Router.events.on('routeChangeStart', handleStart)
    Router.events.on('routeChangeComplete', handleComplete)
    Router.events.on('routeChangeError', handleComplete)

    return () => {
      Router.events.off('routeChangeStart', handleStart)
      Router.events.off('routeChangeComplete', handleComplete)
      Router.events.off('routeChangeError', handleComplete)
    }
  }, [])

  return (
    <ResearchContext.Provider 
      value={{ 
        searchQuery, 
        setSearchQuery,
        researchData,
        setResearchData,
        isLoading,
        setIsLoading
      }}
    >
      <Component {...pageProps} />
    </ResearchContext.Provider>
  )
} 