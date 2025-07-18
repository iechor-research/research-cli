import { createContext, useContext } from 'react'

export interface ResearchContextType {
  searchQuery: string
  setSearchQuery: (query: string) => void
  researchData: any
  setResearchData: (data: any) => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

export const ResearchContext = createContext<ResearchContextType | undefined>(undefined)

export const useResearch = () => {
  const context = useContext(ResearchContext)
  if (context === undefined) {
    throw new Error('useResearch must be used within a ResearchProvider')
  }
  return context
} 