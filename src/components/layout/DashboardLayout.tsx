import React, { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import { Sidebar } from './Sidebar'
import { SearchModal } from '../api-docs/SearchModal'

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsSearchOpen(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="flex min-h-screen bg-slate-50 w-full m-0 p-0 text-left font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center px-8 shadow-sm flex-shrink-0 sticky top-0 z-10">
          <div className="flex-1">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-colors w-64"
            >
              <Search className="w-4 h-4" />
              <span className="flex-1 text-left">Search API...</span>
              <kbd className="hidden sm:inline-block text-[10px] font-mono bg-white px-1.5 py-0.5 rounded shadow-sm border border-slate-200">
                ⌘K
              </kbd>
            </button>
          </div>
        </header>
        <main className="flex-1 p-8 overflow-auto">
          <div className="max-w-6xl mx-auto">{children}</div>
        </main>
      </div>

      <SearchModal 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />
    </div>
  )
}
