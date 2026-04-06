import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Command, X } from 'lucide-react'
import { API_REGISTRY } from '../../apis/api-registry'
import { MethodBadge } from '../ui'

interface SearchResult {
  apiId: string
  apiName: string
  path: string
  method: string
  summary: string
  matchType: 'summary' | 'path' | 'parameter' | 'description'
  snippet: string
}

export function SearchModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleClose = useCallback(() => {
    setQuery('')
    onClose()
  }, [onClose])

  // Handle auto-focus and closing on Escape
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, handleClose])

  const results = useMemo(() => {
    if (!query.trim()) {
      return []
    }

    const q = query.toLowerCase()
    const matches: SearchResult[] = []

    for (const config of API_REGISTRY) {
      for (const [pathUrl, pathItem] of Object.entries(config.spec.paths || {})) {
        const methods = ['get', 'post', 'put', 'delete', 'patch']
        
        for (const method of methods) {
          const operation = pathItem[method as keyof typeof pathItem]
          if (!operation) continue
          
          let matched = false
          
          if (pathUrl.toLowerCase().includes(q)) {
            matches.push({ apiId: config.id, apiName: config.name, path: pathUrl, method, summary: operation.summary || '', matchType: 'path', snippet: pathUrl })
            matched = true
          } else if (operation.summary?.toLowerCase().includes(q)) {
            matches.push({ apiId: config.id, apiName: config.name, path: pathUrl, method, summary: operation.summary, matchType: 'summary', snippet: operation.summary })
            matched = true
          } else if (operation.description?.toLowerCase().includes(q)) {
            const index = operation.description.toLowerCase().indexOf(q)
            const snippet = '...' + operation.description.substring(Math.max(0, index - 20), index + q.length + 20) + '...'
            matches.push({ apiId: config.id, apiName: config.name, path: pathUrl, method, summary: operation.summary || '', matchType: 'description', snippet })
            matched = true
          }

          if (!matched && operation.parameters) {
            for (const param of operation.parameters) {
              if (param.name.toLowerCase().includes(q) || param.description?.toLowerCase().includes(q)) {
                matches.push({ 
                  apiId: config.id, apiName: config.name, path: pathUrl, method, summary: operation.summary || '', 
                  matchType: 'parameter', 
                  snippet: `Parameter matching: ${param.name}` 
                })
                break 
              }
            }
          }
        }
      }
    }
    
    return matches.slice(0, 8)
  }, [query])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4 backdrop-blur-sm bg-slate-950/60 transition-opacity">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[80vh] animate-in slide-in-from-top-4 duration-200">
        
        {/* Search Input */}
        <div className="flex items-center px-4 py-4 border-b border-slate-100 gap-3">
          <Search className="w-5 h-5 text-indigo-500" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search endpoints, descriptions, parameters..."
            className="flex-1 bg-transparent border-none outline-none text-slate-900 text-lg placeholder-slate-400"
          />
          <button 
            onClick={handleClose}
            className="flex items-center justify-center p-1.5 rounded-md bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Body */}
        <div className="overflow-y-auto flex-1 p-2 bg-slate-50/50 min-h-[300px]">

          {query && results.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500 text-center">
              <Search className="w-8 h-8 mb-3 text-slate-300 opacity-50" />
              <p>No results found for "<span className="font-semibold">{query}</span>"</p>
              <p className="text-sm mt-1">Try searching for "pokemon" or "charge".</p>
            </div>
          )}

          {!query && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 text-center">
              <Command className="w-8 h-8 mb-3 text-slate-300" />
              <p>Type anything to search the entire catalogue dynamically.</p>
            </div>
          )}

          {results.length > 0 && (
            <ul className="space-y-1">
              {results.map((r, i) => (
                <li key={i}>
                  <button
                    onClick={() => {
                      navigate(`/docs/${r.apiId}`)
                      handleClose()
                    }}
                    className="w-full text-left bg-white border border-slate-200 hover:border-indigo-400 p-3 rounded-lg flex items-start gap-4 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <MethodBadge method={r.method} className="mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-slate-900 truncate">{r.summary || 'Endpoint'}</span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs text-indigo-600 font-medium truncate">{r.apiName}</span>
                      </div>
                      <p className="font-mono text-xs text-slate-500 truncate">{r.path}</p>
                      
                      <p className="text-xs text-slate-600 mt-2 bg-slate-50 px-2 py-1 rounded inline-block">
                        <span className="font-medium text-slate-800 capitalize mr-1">{r.matchType} match:</span> 
                        {r.snippet}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>
    </div>
  )
}
