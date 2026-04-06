import { useState } from 'react'
import { 
  History, 
  Search, 
  Filter, 
  ArrowRight, 
  Calendar,
  AlertOctagon,
  Sparkles,
  Bug,
  LayoutGrid,
  ChevronDown
} from 'lucide-react'
import { Badge } from '../components/ui'
import changelogData from '../apis/changelog.json'

/* ── Types ────────────────────────────────────────────────── */

type EntryType = 'BREAKING' | 'FEATURE' | 'FIX'

/* ── Main Component ─────────────────────────────────────────── */

export function ChangelogPage() {
  const [filterType, setFilterType] = useState<EntryType | 'ALL'>('ALL')
  const [filterApi, setFilterApi] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  const uniqueApis = Array.from(new Set(changelogData.map(e => e.api)))

  const filteredEntries = changelogData.filter(entry => {
    const matchesType = filterType === 'ALL' || entry.type === filterType
    const matchesApi = filterApi === 'ALL' || entry.api === filterApi
    const matchesSearch = entry.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         entry.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesType && matchesApi && matchesSearch
  })

  const getStyleForType = (type: string) => {
    switch (type.toUpperCase()) {
      case 'BREAKING': return { icon: <AlertOctagon className="w-5 h-5" />, color: 'red', bg: 'bg-red-50 text-red-600 border-red-100' }
      case 'FEATURE': return { icon: <Sparkles className="w-5 h-5" />, color: 'indigo', bg: 'bg-indigo-50 text-indigo-600 border-indigo-100' }
      default: return { icon: <Bug className="w-5 h-5" />, color: 'emerald', bg: 'bg-emerald-50 text-emerald-600 border-emerald-100' }
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 space-y-12 min-h-screen">
      
      {/* Page Header */}
      <div className="text-center space-y-4">
         <div className="inline-flex items-center gap-3 bg-indigo-50 text-indigo-600 px-5 py-2.5 rounded-full text-sm font-black tracking-widest uppercase">
            <History className="w-4 h-4" />
            Product Changelog
         </div>
         <h1 className="text-5xl font-black text-slate-900 tracking-tight">What's New at Kulu</h1>
         <p className="text-slate-500 text-lg max-w-2xl mx-auto font-medium">
           Stay updated with the latest API versions, breaking changes, and performance optimizations.
         </p>
      </div>

      {/* Filters Hub */}
      <div className="bg-white border-2 border-slate-100 p-3 rounded-[32px] shadow-xl shadow-slate-100/50 flex flex-col md:flex-row items-stretch gap-3">
         
         <div className="flex gap-3">
            <div className="relative group">
               <LayoutGrid className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
               <select 
                  value={filterApi}
                  onChange={e => setFilterApi(e.target.value)}
                  className="bg-slate-50/50 hover:bg-slate-50 rounded-[24px] pl-12 pr-10 py-4 outline-none appearance-none cursor-pointer font-bold text-slate-600 text-sm border-none focus:ring-2 focus:ring-indigo-100 transition-all"
               >
                  <option value="ALL">All APIs</option>
                  {uniqueApis.map(api => <option key={api} value={api}>{api}</option>)}
               </select>
               <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
            </div>

            <div className="relative group">
               <Filter className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
               <select 
                  value={filterType}
                  onChange={e => setFilterType(e.target.value as any)}
                  className="bg-slate-50/50 hover:bg-slate-50 rounded-[24px] pl-12 pr-10 py-4 outline-none appearance-none cursor-pointer font-bold text-slate-600 text-sm border-none focus:ring-2 focus:ring-indigo-100 transition-all"
               >
                  <option value="ALL">All Changes</option>
                  <option value="BREAKING">Breaking Changes</option>
                  <option value="FEATURE">Features</option>
                  <option value="FIX">Fixes</option>
               </select>
               <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
            </div>
         </div>
      </div>

      {/* Feed */}
      <div className="space-y-12">
         {filteredEntries.length === 0 ? (
            <div className="py-20 text-center space-y-4 bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-200">
               <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm text-slate-300">
                  <Search className="w-8 h-8" />
               </div>
               <p className="text-slate-500 font-bold">No updates found matching your filters.</p>
               <button onClick={() => { setFilterType('ALL'); setFilterApi('ALL'); setSearchQuery('') }} className="text-indigo-600 font-black hover:underline">
                  Clear all filters
               </button>
            </div>
         ) : (
            filteredEntries.map((entry, idx) => {
               const style = getStyleForType(entry.type)
               return (
                  <div key={idx} className="group relative pl-12 before:absolute before:left-[1.375rem] before:top-14 before:bottom-0 before:w-px before:bg-slate-100 last:before:hidden">
                     
                     <div className="flex items-center gap-4 mb-6">
                        <div className={`absolute left-0 top-0 w-11 h-11 rounded-full flex items-center justify-center border shadow-sm transition-transform group-hover:scale-110 ${style.bg}`}>
                           {style.icon}
                        </div>
                        <div className="flex items-center gap-2">
                           <span className="text-sm font-black text-slate-900 bg-slate-100 px-3 py-1 rounded-lg tabular-nums">
                              {entry.id}
                           </span>
                           <span className="text-xs font-black text-slate-400 flex items-center gap-1.5 ml-2">
                              <Calendar className="w-3.5 h-3.5" />
                              {entry.date}
                           </span>
                        </div>
                     </div>

                     <div className="bg-white hover:bg-slate-50/[0.3] border border-slate-100 rounded-[40px] p-10 shadow-sm transition-all duration-300">
                        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                           <Badge colour={style.color as any}>{entry.type}</Badge>
                           <h2 className="text-2xl font-black text-slate-900 tracking-tight flex-1">
                              {entry.title}
                           </h2>
                        </div>
                        
                        <p className="text-slate-500 font-medium text-lg leading-relaxed max-w-3xl mb-8">
                           {entry.description}
                        </p>

                        <div className="flex items-center justify-between pt-8 border-t border-slate-50">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                                 <LayoutGrid className="w-4 h-4" />
                              </div>
                              <span className="text-sm font-black text-slate-400">API: <span className="text-indigo-600">{entry.api}</span></span>
                           </div>
                           <button className="flex items-center gap-2 text-slate-400 font-black text-sm group-hover:text-indigo-600 transition-colors">
                              View Docs
                              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                           </button>
                        </div>
                     </div>
                  </div>
               )
            })
         )}
      </div>


    </div>
  )
}
