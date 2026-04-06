import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { 
  Plus, 
  Key, 
  Trash2, 
  Copy, 
  Check, 
  AlertTriangle, 
  Calendar, 
  Shield,
  Clock,
  ChevronRight,
  X,
  Loader2,
  FileText,
  FileJson
} from 'lucide-react'
import { Badge, Spinner } from '../components/ui'
import { format } from 'date-fns'
import { generateClientMask } from '../utils/security'


interface ApiKey {
  id: string
  name: string
  environment: 'sandbox' | 'production'
  key_masked: string
  created_at: string
  last_used_at: string | null
  expires_at: string | null
}

interface NewKeyResponse {
  full_key: string
  masked_key: string
  inserted_id: string
  name: string
  environment: 'sandbox' | 'production'
}


export function ApiKeyPage() {
  const queryClient = useQueryClient()
  
  // UI State
  const [isCreateModalOpen, setCreateModalOpen] = useState(false)
  const [revokingKeyId, setRevokingKeyId] = useState<string | null>(null)
  const [newKeyData, setNewKeyData] = useState<NewKeyResponse | null>(null)
  const [copied, setCopied] = useState(false)

  // Form State
  const [name, setName] = useState('')
  const [environment, setEnvironment] = useState<'sandbox' | 'production'>('sandbox')
  const [expiryDate, setExpiryDate ] = useState<string>('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const { data: keys = [], isLoading } = useQuery({
    queryKey: ['api-keys'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('api_keys')
        .select('id, name, environment, key_masked, created_at, last_used_at, expires_at')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data as ApiKey[]
    }
  })

  const createMutation = useMutation({
    mutationFn: async () => {
      const clientMask = generateClientMask()

      // Calling our custom RPC that generates the key server-side
      const { data, error } = await supabase.rpc('generate_api_key', {
        key_name: name,
        key_env: environment,
        client_mask: clientMask,
        key_expiry: expiryDate ? new Date(expiryDate).toISOString() : null
      })
      
      if (error) throw error
      const response = data[0]
      
    
      return {
        full_key: response.scrambled_key || response.full_key,
        masked_key: response.masked_key,
        inserted_id: response.inserted_id
      } as NewKeyResponse
    },
    onSuccess: (data) => {
      setNewKeyData({
        ...data,
        name,
        environment
      })
      setCreateModalOpen(false)
      setErrorMessage(null)
      queryClient.invalidateQueries({ queryKey: ['api-keys'] })
      // Reset form fields
      setName('')
      setEnvironment('sandbox')
      setExpiryDate('')
    },
    onError: (err: Error) => {
      setErrorMessage(err.message || 'Failed to generate key. Ensure you have run the Supabase SQL setup.')
    }
  })

  const revokeMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', id)
      
      if (error) throw error
    },
    onSuccess: () => {
      setRevokingKeyId(null)
      setErrorMessage(null)
      queryClient.invalidateQueries({ queryKey: ['api-keys'] })
    },
    onError: (err: Error) => {
      setErrorMessage(err.message || 'Failed to revoke key.')
      setRevokingKeyId(null)
    }
  })

  const handleCopyHash = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadKey = (format: 'txt' | 'json') => {
    if (!newKeyData) return
    const filename = `kulu-api-key-${newKeyData.environment}-${format === 'txt' ? 'secret.txt' : 'config.json'}`
    let content = ''
    let type = ''

    if (format === 'txt') {
      content = `Kulu API Key\nName: ${newKeyData.name}\nEnvironment: ${newKeyData.environment}\nSecret: ${newKeyData.full_key}\nCreated: ${new Date().toISOString()}\n\nKEEP THIS SECRET SECURE`
      type = 'text/plain'
    } else {
      content = JSON.stringify({
        name: newKeyData.name,
        environment: newKeyData.environment,
        api_key: newKeyData.full_key,
        created_at: new Date().toISOString()
      }, null, 2)
      type = 'application/json'
    }

    const blob = new Blob([content], { type })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  }


  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6">
      
      {/* Error Banner */}
      {errorMessage && (
        <div className="mb-6 flex items-center justify-between bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            <span className="text-sm font-medium">{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <Shield className="w-8 h-8 text-indigo-600" />
            API Key Management
          </h1>
          <p className="text-slate-500 mt-2 max-w-2xl">
            Securely generate and manage authentication keys for your applications. 
            Production keys provide access to live fintech sets, while Sandbox keys are for testing.
          </p>
        </div>
        <button 
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl font-semibold shadow-lg shadow-indigo-200 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Generate New Key
        </button>
      </div>

      {/* Stats / Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Total Active Keys</div>
          <div className="text-3xl font-bold text-slate-900">{keys.length}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Environments</div>
          <div className="flex gap-2 items-center mt-1">
             <Badge colour="green">Production</Badge>
             <Badge colour="amber">Sandbox</Badge>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Security Status</div>
          <div className="flex items-center gap-2 text-emerald-600 font-semibold text-sm">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
             End-to-End Encrypted
          </div>
        </div>
      </div>

      {/* API Keys Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden border-separate">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <Spinner size="lg" className="mb-4" />
            <p className="font-medium">Fetching secure keys...</p>
          </div>
        ) : keys.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center px-6">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 text-slate-300">
              <Key className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No active API keys</h3>
            <p className="text-slate-500 max-w-sm mt-2">
              You haven't generated any keys yet. Create your first key to start authenticating your requests.
            </p>
            <button 
              onClick={() => setCreateModalOpen(true)}
              className="mt-6 text-indigo-600 font-semibold flex items-center gap-2 hover:text-indigo-700 underline underline-offset-4"
            >
              Get started with a Sandbox key
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Key Name</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Environment</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Token</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Last Used</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {keys.map((key) => (
                  <tr key={key.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="font-semibold text-slate-900">{key.name}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-1">
                        <Calendar className="w-3 h-3" />
                        Created {format(new Date(key.created_at), 'MMM dd, yyyy')}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <Badge colour={key.environment === 'production' ? 'green' : 'amber'}>
                        {key.environment.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="px-6 py-5">
                      <code className="bg-slate-100 text-slate-600 px-2 py-1 rounded-md text-xs font-mono">
                        {key.key_masked}
                      </code>
                    </td>
                    <td className="px-6 py-5">
                      {key.last_used_at ? (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                           <Clock className="w-3.5 h-3.5 text-slate-400" />
                           {format(new Date(key.last_used_at), 'MMM dd, HH:mm')}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-xs">Never used</span>
                      )}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button 
                        onClick={() => setRevokingKeyId(key.id)}
                        className="text-slate-400 hover:text-red-600 transition-colors p-2"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Security Tip Footer */}
      <div className="mt-8 flex items-start gap-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl p-5">
        <div className="mt-1">
          <AlertTriangle className="w-5 h-5 text-indigo-500" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-indigo-900">Security Best Practices</h4>
          <p className="text-sm text-indigo-700/80 mt-1">
            Never share your API keys in public forums or client-side code that isn't obfuscated. 
            Rotate your keys every 90 days to maintain optimal security posture.
          </p>
        </div>
      </div>

      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
           <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
             <div className="p-8">
               <div className="flex items-center justify-between mb-6">
                 <h2 className="text-2xl font-bold text-slate-900 text-center flex-1 ml-4 overflow-hidden text-ellipsis whitespace-nowrap">Create New API Key</h2>
                 <button onClick={() => setCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                   <X className="w-6 h-6" />
                 </button>
               </div>
               
               <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); createMutation.mutate() }}>
                 <div>
                   <label className="block text-sm font-bold text-slate-700 mb-2">Key Name</label>
                   <input 
                     required
                     placeholder="e.g. My Website App"
                     value={name}
                     onChange={e => setName(e.target.value)}
                     className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                   />
                 </div>
                 
                 <div>
                   <label className="block text-sm font-bold text-slate-700 mb-3">Target Environment</label>
                   <div className="grid grid-cols-2 gap-3">
                     <button
                        type="button"
                        onClick={() => setEnvironment('sandbox')}
                        className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all font-semibold ${
                          environment === 'sandbox' 
                            ? 'border-amber-500 bg-amber-50 text-amber-700' 
                            : 'border-slate-100 text-slate-500 hover:border-slate-200'
                        }`}
                     >
                       Sandbox
                     </button>
                     <button
                        type="button"
                        onClick={() => setEnvironment('production')}
                        className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all font-semibold ${
                          environment === 'production' 
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                            : 'border-slate-100 text-slate-500 hover:border-slate-200'
                        }`}
                     >
                       Production
                     </button>
                   </div>
                 </div>

                 <div>
                   <label className="block text-sm font-bold text-slate-700 mb-2">Expiry Date (Optional)</label>
                   <div className="relative">
                      <input 
                        type="date"
                        value={expiryDate}
                        onChange={e => setExpiryDate(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pl-11 outline-none appearance-none"
                      />
                      <Calendar className="w-5 h-5 text-slate-400 absolute left-4 top-3.5 pointer-events-none" />
                   </div>
                 </div>

                 <button 
                   type="submit"
                   disabled={createMutation.isPending}
                   className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 transition-all mt-8"
                 >
                   {createMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Key className="w-5 h-5" />}
                   {createMutation.isPending ? 'Generating...' : 'Generate API Key'}
                 </button>
               </form>
             </div>
           </div>
        </div>
      )}

      {newKeyData && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[60] flex items-center justify-center p-4 animate-in fade-in duration-300">
           <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-500">
             <div className="p-10 space-y-8">
               <div className="text-center">
                 <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-emerald-100">
                    <Key className="w-10 h-10" />
                 </div>
                 <h2 className="text-3xl font-extrabold text-slate-900">Your New Key is Ready</h2>
                 <p className="text-slate-500 mt-3 px-4">
                   This is your secret key. For security, we will **never show it to you again** after you close this window.
                 </p>
               </div>

               <div className="bg-slate-950 rounded-2xl p-1 shadow-inner relative group">
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest absolute top-3 left-4">Secret Key</div>
                  <div className="p-6 pt-10 text-indigo-300 font-mono text-sm break-all leading-relaxed whitespace-pre-wrap select-all">
                    {newKeyData.full_key}
                  </div>
                  <button 
                    onClick={() => handleCopyHash(newKeyData.full_key)}
                    className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white rounded-lg p-2.5 transition-all active:scale-95 group"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
               </div>

               <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3 text-amber-600 bg-amber-50 border border-amber-100 p-4 rounded-xl text-sm font-medium">
                     <AlertTriangle className="w-6 h-6 shrink-0" />
                     Make sure to copy or download it now! If you lose this key, you will need to revoke it and generate a new one.
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => downloadKey('txt')}
                      className="flex items-center justify-center gap-2 py-3 px-4 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl font-bold transition-all"
                    >
                      <FileText className="w-4 h-4" />
                      Download .txt
                    </button>
                    <button 
                      onClick={() => downloadKey('json')}
                      className="flex items-center justify-center gap-2 py-3 px-4 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl font-bold transition-all"
                    >
                      <FileJson className="w-4 h-4" />
                      Download .json
                    </button>
                  </div>

                  <button 
                    onClick={() => setNewKeyData(null)}
                    className="w-full py-4 bg-slate-900 hover:bg-black text-white rounded-2xl font-bold shadow-md transition-all mt-4"
                  >
                    I have saved this key
                  </button>
               </div>
             </div>
           </div>
        </div>
      )}

      {revokingKeyId && (
        <div className="fixed inset-0 bg-red-950/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-8 animate-in zoom-in-95 duration-150">
             <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mb-6">
                <Trash2 className="w-8 h-8" />
             </div>
             <h3 className="text-xl font-bold text-slate-900 line-clamp-2">Revoke this API key?</h3>
             <p className="text-slate-500 mt-3 text-sm leading-relaxed">
               This action cannot be undone. Any applications using this key will immediately lose access to the portal APIs.
             </p>
             <div className="grid grid-cols-2 gap-3 mt-8">
               <button 
                 onClick={() => setRevokingKeyId(null)}
                 className="py-3 px-4 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-colors"
               >
                 Cancel
               </button>
               <button 
                 onClick={() => revokeMutation.mutate(revokingKeyId)}
                 disabled={revokeMutation.isPending}
                 className="py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-red-100"
               >
                 {revokeMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Revoke Key'}
               </button>
             </div>
           </div>
        </div>
      )}

    </div>
  )
}
