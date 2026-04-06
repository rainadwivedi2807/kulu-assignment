import { useState, useMemo } from 'react'
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  Cell,
  PieChart,
  Pie
} from 'recharts'
import { 
  Activity, 
  AlertCircle, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight,
  Filter,
  Globe
} from 'lucide-react'
import { Badge } from '../components/ui'
import { format, subDays, eachDayOfInterval } from 'date-fns'

/* ── Mock Data Generation ────────────────────────────────────── */

const MOCK_ENDPOINTS = [
  { path: '/v1/payments/initiate', calls: 45200, errorRate: 0.2, latency: 145 },
  { path: '/v1/accounts/balance', calls: 32000, errorRate: 0.5, latency: 89 },
  { path: '/v1/webhooks/subscribe', calls: 12500, errorRate: 2.1, latency: 412 },
  { path: '/v1/auth/token', calls: 28400, errorRate: 0.1, latency: 45 },
  { path: '/v1/users/profile', calls: 18900, errorRate: 0.4, latency: 112 },
]

const generateTimeSeries = (days: number) => {
  const end = new Date()
  const start = subDays(end, days - 1)
  const interval = eachDayOfInterval({ start, end })

  return interval.map(date => ({
    date: format(date, 'MMM dd'),
    calls: Math.floor(Math.random() * 5000) + 1500,
    errors: Math.floor(Math.random() * 100),
    latency: Math.floor(Math.random() * 50) + 80,
  }))
}

/* ── Main Component ─────────────────────────────────────────── */

export function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d'>('7d')
  
  const timeSeriesData = useMemo(() => 
    generateTimeSeries(timeRange === '7d' ? 7 : 30), 
    [timeRange]
  )

  const stats = {
    totalCalls: timeSeriesData.reduce((acc, d) => acc + d.calls, 0),
    avgLatency: Math.floor(timeSeriesData.reduce((acc, d) => acc + d.latency, 0) / timeSeriesData.length),
    errorRate: (timeSeriesData.reduce((acc, d) => acc + d.errors, 0) / timeSeriesData.reduce((acc, d) => acc + d.calls, 0) * 100).toFixed(2)
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 space-y-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <Activity className="w-8 h-8 text-indigo-600" />
            Usage Analytics
          </h1>
          <p className="text-slate-500 mt-2">
            Real-time insights across your API ecosystem. Monitor performance, errors, and adoption.
          </p>
        </div>
        
        <div className="flex items-center gap-3 bg-white p-1 rounded-2xl border border-slate-200 shadow-sm self-start md:self-center">
          <button 
            onClick={() => setTimeRange('7d')}
            className={`px-4 py-2 text-sm font-bold rounded-xl transition-all ${
              timeRange === '7d' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            7 Days
          </button>
          <button 
            onClick={() => setTimeRange('30d')}
            className={`px-4 py-2 text-sm font-bold rounded-xl transition-all ${
              timeRange === '30d' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            30 Days
          </button>
        </div>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm group hover:border-indigo-200 transition-all">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
             <Globe className="w-6 h-6" />
          </div>
          <div className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Total API Volume</div>
          <div className="text-3xl font-black text-slate-900 tabular-nums">
            {stats.totalCalls.toLocaleString()}
          </div>
          <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 mt-2">
            <ArrowUpRight className="w-3 h-3" />
            +12.5% from last period
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm group hover:border-red-200 transition-all">
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
             <AlertCircle className="w-6 h-6" />
          </div>
          <div className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Failed Requests (4xx/5xx)</div>
          <div className="text-3xl font-black text-slate-900 tabular-nums">
            {stats.errorRate}%
          </div>
          <p className="text-[11px] text-red-600 font-bold flex items-center gap-1 mt-2">
            <ArrowUpRight className="w-3 h-3" />
            +0.12% higher than usual
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm group hover:border-emerald-200 transition-all">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
             <Clock className="w-6 h-6" />
          </div>
          <div className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">P95 Avg. Latency</div>
          <div className="text-3xl font-black text-slate-900 tabular-nums">
            {stats.avgLatency}ms
          </div>
          <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 mt-2">
            <ArrowDownRight className="w-3 h-3" />
            -4ms from last period
          </p>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Traffic Over Time</h3>
              <p className="text-sm text-slate-400">Total volume of successful calls per day</p>
            </div>
            <button className="text-slate-400 hover:text-indigo-600 p-2 transition-colors">
              <Filter className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6 h-80 flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeSeriesData}>
                <defs>
                  <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    padding: '12px'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="calls" 
                  stroke="#6366f1" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorCalls)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 h-20 flex items-center">
             <h3 className="text-lg font-extrabold text-slate-900">Health Breakdown</h3>
          </div>
          <div className="p-6 flex-1 flex flex-col items-center justify-center">
             <div className="h-48 w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie
                     data={[
                       { name: 'Success', value: 98.4 },
                       { name: 'Errors', value: 1.6 }
                     ]}
                     innerRadius={60}
                     outerRadius={80}
                     paddingAngle={5}
                     dataKey="value"
                   >
                     <Cell fill="#10b981" />
                     <Cell fill="#ef4444" />
                   </Pie>
                 </PieChart>
               </ResponsiveContainer>
             </div>
             <div className="mt-6 w-full space-y-3">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-emerald-500" />
                      <span className="text-sm font-medium text-slate-600">Success</span>
                   </div>
                   <span className="text-sm font-bold text-slate-900">98.4%</span>
                </div>
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <span className="text-sm font-medium text-slate-600">Errors</span>
                   </div>
                   <span className="text-sm font-bold text-slate-900">1.6%</span>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Endpoint Table Section */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900">Top Performing Endpoints</h3>
            <p className="text-sm text-slate-400">Detailed breakdown per API resource</p>
          </div>
          <div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Endpoint Path</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Total Calls</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Avg. Latency</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Error Rate</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 italic font-mono text-xs">
              {MOCK_ENDPOINTS.map((ep, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-5">
                    <span className="font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-md">{ep.path}</span>
                  </td>
                  <td className="px-6 py-5 text-slate-600 tabular-nums">
                    {ep.calls.toLocaleString()}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-slate-900 font-bold">
                       {ep.latency}ms
                       {ep.latency < 100 ? (
                         <ArrowDownRight className="w-3 h-3 text-emerald-500" />
                       ) : (
                         <ArrowUpRight className="w-3 h-3 text-amber-500" />
                       )}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-slate-600">
                    <div className="flex items-center gap-3">
                       <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden w-24">
                          <div 
                            className={`h-full rounded-full ${ep.errorRate > 1 ? 'bg-red-500' : 'bg-indigo-500'}`} 
                            style={{ width: `${Math.min(ep.errorRate * 50, 100)}%` }} 
                          />
                       </div>
                       <span className="font-bold text-slate-900">{ep.errorRate}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <Badge colour={ep.errorRate > 2 ? 'red' : ep.errorRate > 1 ? 'amber' : 'green'}>
                      {ep.errorRate > 2 ? 'DEGRADED' : ep.errorRate > 1 ? 'WARNING' : 'HEALTHY'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-slate-50/50 border-t border-slate-100 text-center">
            <button className="text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors">
                View all endpoints and historic data
            </button>
        </div>
      </div>
    </div>
  )
}
