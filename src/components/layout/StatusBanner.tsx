import { AlertTriangle, X, ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

export function StatusBanner() {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <div className="bg-amber-600/90 backdrop-blur-md text-white py-3 px-4 sm:px-6 sticky top-0 z-[100] shadow-xl animate-in slide-in-from-top duration-500 overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-white/5 to-amber-500/0 -translate-x-[200%] group-hover:translate-x-[200%] transition-transform duration-[2000ms] ease-in-out pointer-events-none" />
      
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center shrink-0 animate-pulse">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <p className="text-sm font-black tracking-tight truncate">
            <span className="hidden sm:inline">Active Incident — </span>
            <span className="opacity-90">Partial degradation in 'Accounts & KYC' API. Performance may be impacted.</span>
          </p>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <Link 
            to="/status" 
            className="hidden md:flex items-center gap-1.5 bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg text-xs font-black transition-all active:scale-95"
          >
            Resolution Details
            <ArrowRight className="w-3 h-3" />
          </Link>
          <button 
            onClick={() => setIsVisible(false)}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
