import React from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  BookOpen,
  TerminalSquare,
  Key,
  BarChart3,
  Activity,
  History,
  Zap,
  LogOut,
} from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { useAuth } from '../../context/useAuth'
import { API_REGISTRY } from '../../apis/api-registry'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const navItems = [
  { name: 'Catalogue & Docs', path: '/docs', icon: BookOpen },
  { name: 'Interactive Sandbox', path: '/sandbox', icon: TerminalSquare },
  { name: 'API Keys', path: '/keys', icon: Key },
  { name: 'Usage Analytics', path: '/analytics', icon: BarChart3 },
  { name: 'API Status', path: '/status', icon: Activity },
  { name: 'Changelog', path: '/changelog', icon: History },
]

export function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, signOut } = useAuth()

  const email = user?.email ?? 'Developer'
  const initial = email[0].toUpperCase()

  async function handleSignOut() {
    await signOut()
    navigate('/login', { replace: true })
  }

  return (
    <div className="w-72 bg-slate-900 text-slate-300 flex flex-col h-screen border-r border-slate-800 flex-shrink-0 sticky top-0 overflow-y-auto">
      <div className="p-6 flex items-center gap-3">
        <div className="bg-indigo-500/20 p-2 rounded-lg text-indigo-400">
          <Zap className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Developer Portal
          </h1>
          <p className="text-xs text-slate-400 font-medium tracking-wider uppercase mt-1">
            Kulu API
          </p>
        </div>
      </div>

      <div className="px-4 pb-6 mt-4 flex-1">
        <div className="mb-4 px-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Menu
          </p>
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path)
            const Icon = item.icon

            return (
              <React.Fragment key={item.path}>
              <NavLink
                to={item.path}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative',
                  isActive
                    ? 'text-white bg-slate-800'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50',
                )}
              >
                {isActive && item.path !== '/docs' && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-indigo-500 rounded-r-full" />
                )}
                <Icon
                  className={cn(
                    'w-5 h-5 transition-colors',
                    isActive
                      ? 'text-indigo-400'
                      : 'text-slate-500 group-hover:text-slate-400',
                  )}
                />
                {item.name}
              </NavLink>
              
              {/* Inject inner API Registry mapping directly under Catalogue & Docs */}
              {item.path === '/docs' && isActive && (
                 <div className="ml-5 mt-1 mb-2 pl-4 border-l border-slate-800 flex flex-col gap-1">
                   {API_REGISTRY.map((api) => {
                     const isApiActive = location.pathname.includes(`/docs/${api.id}`)
                     return (
                       <NavLink 
                         key={api.id}
                         to={`/docs/${api.id}`}
                         className={cn(
                           'px-3 py-2 rounded-lg text-sm transition-colors text-left',
                           isApiActive 
                            ? 'text-indigo-400 bg-slate-800' 
                            : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'
                         )}
                       >
                         {api.name}
                       </NavLink>
                     )
                   })}
                 </div>
              )}
              </React.Fragment>
            )
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-800 shrink-0">
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 flex-shrink-0 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold shadow-inner text-xs">
              {initial}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium text-white truncate">
                {email}
              </span>
              <span className="text-xs text-slate-400 truncate">Developer</span>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            title="Sign out"
            aria-label="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
