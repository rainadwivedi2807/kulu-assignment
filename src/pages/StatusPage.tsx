import { 
  ShieldCheck, 
  ShieldAlert, 
  ShieldX, 
  Clock, 
  History, 
  ExternalLink,
  ChevronRight,
  TrendingDown,
  AlertTriangle,
  Info
} from 'lucide-react'
import { Badge } from '../components/ui'

/* ── Mock Status Data ───────────────────────────────────────── */

const API_STATUSES = [
  { 
    name: 'Core Payments API', 
    status: 'operational', 
    uptime: '99.99%', 
    latency: '112ms',
    regions: ['US-East', 'EU-West', 'AP-South']
  },
  { 
    name: 'Accounts & KYC', 
    status: 'degraded', 
    uptime: '98.45%', 
    latency: '450ms',
    regions: ['US-East', 'EU-West'] 
  },
  { 
    name: 'Webhooks & Messaging', 
    status: 'operational', 
    uptime: '99.91%', 
    latency: '12ms',
    regions: ['Global Edge']
  },
  { 
    name: 'Auth Service', 
    status: 'operational', 
    uptime: '100.0%', 
    latency: '45ms',
    regions: ['Global Edge']
  },
]

const INCIDENT_HISTORY = [
  {
    title: 'Increased Latency in Accounts API',
    type: 'degraded',
    resolved: false,
    timestamp: '2 hours ago',
    description: 'We are investigating reports of slow response times for balance inquiries in the US-East region.',
    updates: [
      { time: '1 hour ago', note: 'Identified bottleneck in upstream provider. Routing traffic via backup nodes.' },
      { time: '2 hours ago', note: 'Monitoring elevated latency across all account-related endpoints.' }
    ]
  },
  {
    title: 'Intermittent Failures in Payment Webhooks',
    type: 'outage',
    resolved: true,
    timestamp: 'Oct 12, 14:20 UTC',
    description: 'Database connection pool exhaustion caused minor packet loss for outbound webhooks.',
    updates: [
      { time: 'Oct 12, 16:00 UTC', note: 'Pool size increased. System stabilized.' }
    ]
  }
]

/* ── Main Component ─────────────────────────────────────────── */

export function StatusPage() {
  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-12">
      
      {/* Header with Global Health */}
      <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-3xl p-8 md:p-12 text-white shadow-2xl relative overflow-hidden">
         <div className="absolute top-0 right-0 p-8 opacity-20 transform translate-x-1/4 -translate-y-1/4">
             <ShieldCheck className="w-64 h-64" />
         </div>
         
         <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-4">
               <h1 className="text-4xl font-black tracking-tight">System Status</h1>
               <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-amber-400 animate-pulse shadow-[0_0_10px_rgba(251,191,36,0.8)]" />
                  <span className="text-xl font-bold text-slate-100">Partial System Degradation</span>
               </div>
               <p className="text-indigo-200/80 max-w-xl text-lg leading-relaxed">
                 We are currently monitoring an incident in the Accounts API. 
                 All other critical systems remain operational and healthy.
               </p>
            </div>
            <div className="flex flex-col gap-3">
               <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/5">
                  <div className="text-[10px] text-indigo-300 font-black uppercase tracking-widest mb-1">90-Day Aggregate Uptime</div>
                  <div className="text-3xl font-black text-white">99.982%</div>
               </div>
            </div>
         </div>
      </div>

      {/* API Health Grid */}
      <section className="space-y-6">
         <div className="flex items-center justify-between px-2">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
               <ShieldCheck className="w-7 h-7 text-indigo-600" />
               Current Service Health
            </h2>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {API_STATUSES.map((api, i) => (
               <div key={i} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:border-indigo-100 transition-all group flex items-center gap-5">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                    api.status === 'operational' ? 'bg-emerald-50 text-emerald-600' : 
                    api.status === 'degraded' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
                  }`}>
                    {api.status === 'operational' ? <ShieldCheck className="w-7 h-7" /> : 
                     api.status === 'degraded' ? <ShieldAlert className="w-7 h-7" /> : <ShieldX className="w-7 h-7" />}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                     <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-slate-900 truncate">{api.name}</h4>
                        <Badge colour={api.status === 'operational' ? 'green' : api.status === 'degraded' ? 'amber' : 'red'}>
                           {api.status.toUpperCase()}
                        </Badge>
                     </div>
                     <div className="flex items-center gap-4 text-xs text-slate-400 font-bold overflow-hidden">
                        <span className="flex items-center gap-1">
                           <Clock className="w-3 h-3" />
                           {api.uptime}
                        </span>
                        <span className="flex items-center gap-1">
                           <TrendingDown className="w-3 h-3" />
                           {api.latency}
                        </span>
                     </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
               </div>
            ))}
         </div>
      </section>

      {/* Incident History Feed */}
      <section className="space-y-6">
         <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3 px-2">
            <History className="w-7 h-7 text-indigo-600" />
            Recent Incident Log
         </h2>
         
         <div className="space-y-6">
            {INCIDENT_HISTORY.map((incident, i) => (
               <div key={i} className="relative pl-12 before:absolute before:left-[1.375rem] before:top-8 before:bottom-0 before:w-px before:bg-slate-200 last:before:hidden">
                  <div className={`absolute left-0 top-0 w-11 h-11 rounded-2xl flex items-center justify-center border shadow-sm ${
                    incident.type === 'degraded' ? 'bg-amber-50 border-amber-200 text-amber-600' : 'bg-red-50 border-red-200 text-red-600'
                  }`}>
                    {incident.type === 'degraded' ? <AlertTriangle className="w-5 h-5" /> : <ShieldX className="w-5 h-5" />}
                  </div>
                  
                  <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-4">
                     <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                        <h3 className="text-xl font-extrabold text-slate-900">{incident.title}</h3>
                        <div className="flex items-center gap-3">
                           <span className="text-xs font-bold text-slate-400">{incident.timestamp}</span>
                           <Badge colour={incident.resolved ? 'green' : 'amber'}>
                              {incident.resolved ? 'RESOLVED' : 'ACTIVE'}
                           </Badge>
                        </div>
                     </div>
                     
                     <p className="text-slate-600 leading-relaxed max-w-3xl">
                        {incident.description}
                     </p>
                     
                     <div className="pt-4 border-t border-slate-100 flex flex-col gap-4">
                        {incident.updates.map((update, j) => (
                           <div key={j} className="flex gap-4">
                              <span className="text-[10px] font-black text-indigo-400 mt-1 uppercase w-20 shrink-0">{update.time}</span>
                              <div className="flex-1 flex gap-2">
                                 <Info className="w-4 h-4 text-slate-300 mt-1" />
                                 <p className="text-sm text-slate-500 italic">{update.note}</p>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            ))}
         </div>
      </section>


    </div>
  )
}
