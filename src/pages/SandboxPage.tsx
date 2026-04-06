import { useState, useMemo } from 'react'
import { useMutation } from '@tanstack/react-query'
import { API_REGISTRY } from '../apis/api-registry'
import { Badge, CodeBlock, MethodBadge, Spinner } from '../components/ui'
import { Play, Activity } from 'lucide-react'
import type { OpenAPIOperation } from '../types/openapi'

interface SandboxResponse {
  status: number
  data: unknown
  headers: Record<string, string>
}

interface SandboxRequest {
  baseUrl: string
  pathUrl: string
  method: string
  params: Record<string, string>
  parameters: OpenAPIOperation['parameters']
  requestBody?: string
}

/**
 * Executes an API request. Used as mutationFn for TanStack useMutation.
 */
async function executeApiRequest(req: SandboxRequest): Promise<SandboxResponse> {
  let finalPath = req.pathUrl
  const queryParams = new URLSearchParams()
  const headers: Record<string, string> = {
    'Accept': 'application/json',
  }

  for (const param of req.parameters || []) {
    const val = req.params[param.name]
    if (!val) continue

    if (param.in === 'path') {
      finalPath = finalPath.replace(`{${param.name}}`, encodeURIComponent(val))
    } else if (param.in === 'query') {
      queryParams.append(param.name, val)
    } else if (param.in === 'header') {
      headers[param.name] = val
    }
  }

  const qs = queryParams.toString()
  const fullUrl = `${req.baseUrl}${finalPath}${qs ? `?${qs}` : ''}`

  const fetchOptions: RequestInit = {
    method: req.method.toUpperCase(),
    headers,
  }

  if (['post', 'put', 'patch'].includes(req.method) && req.requestBody) {
    fetchOptions.body = req.requestBody
    headers['Content-Type'] = 'application/json'
  }

  const res = await fetch(fullUrl, fetchOptions)

  let data: unknown
  try {
    data = await res.json()
  } catch {
    data = await res.text()
  }

  const responseHeaders: Record<string, string> = {}
  res.headers.forEach((val, key) => {
    responseHeaders[key] = val
  })

  return { status: res.status, data, headers: responseHeaders }
}

export function SandboxPage() {
  const [selectedApiId, setSelectedApiId] = useState<string>(API_REGISTRY[0]?.id || '')

  const apiConfig = useMemo(() => API_REGISTRY.find(a => a.id === selectedApiId), [selectedApiId])
  const spec = apiConfig?.spec

  const availableEndpoints = useMemo(() => {
    if (!spec?.paths) return []
    const list: { pathUrl: string; method: string; operation: OpenAPIOperation }[] = []
    for (const [pathUrl, pathItem] of Object.entries(spec.paths)) {
      const methods = ['get', 'post', 'put', 'delete', 'patch']
      for (const method of methods) {
        if (pathItem[method as keyof typeof pathItem]) {
          list.push({
            pathUrl,
            method,
            operation: pathItem[method as keyof typeof pathItem] as OpenAPIOperation,
          })
        }
      }
    }
    return list
  }, [spec])

  const [selectedEndpointIndex, setSelectedEndpointIndex] = useState<number>(0)
  const endpoint = availableEndpoints[selectedEndpointIndex]

  const [params, setParams] = useState<Record<string, string>>({})
  const [requestBody, setRequestBody] = useState<string>('')

  const mutation = useMutation({
    mutationFn: executeApiRequest,
  })

  const handleApiChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedApiId(e.target.value)
    setSelectedEndpointIndex(0)
    setParams({})
    setRequestBody('')
    mutation.reset()
  }

  const handleEndpointChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedEndpointIndex(Number(e.target.value))
    setParams({})
    setRequestBody('')
    mutation.reset()
  }

  const handleParamChange = (name: string, value: string) => {
    setParams(prev => ({ ...prev, [name]: value }))
  }

  const handleExecute = () => {
    if (!apiConfig || !endpoint) return
    mutation.mutate({
      baseUrl: apiConfig.baseUrl,
      pathUrl: endpoint.pathUrl,
      method: endpoint.method,
      params,
      parameters: endpoint.operation.parameters,
      requestBody: ['post', 'put', 'patch'].includes(endpoint.method) ? requestBody : undefined,
    })
  }

  if (!apiConfig || !endpoint) return <div>Loading sandbox...</div>

  return (
    <div className="max-w-6xl mx-auto py-8 animate-in fade-in duration-500 min-h-screen grid grid-cols-1 xl:grid-cols-2 gap-8">

      {/* Left Column: Form Configuration */}
      <div className="space-y-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Activity className="w-8 h-8 text-indigo-500" />
            Interactive Sandbox
          </h1>
          <p className="text-slate-500 mt-2">Test your API queries securely in real-time straight from the browser.</p>
        </div>

        {/* Global Selectors */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Target API</label>
            <select
              value={selectedApiId}
              onChange={handleApiChange}
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 transition-shadow"
            >
              {API_REGISTRY.map(api => (
                <option key={api.id} value={api.id}>{api.name} ({api.version})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Target Endpoint</label>
            <select
              value={selectedEndpointIndex}
              onChange={handleEndpointChange}
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 transition-shadow cursor-pointer"
            >
              {availableEndpoints.map((ep, idx) => (
                <option key={idx} value={idx}>
                  {ep.method.toUpperCase()} {ep.pathUrl} — {ep.operation.summary}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Auto Generated Form Builder */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <MethodBadge method={endpoint.method} />
            <code className="text-slate-800 font-mono text-sm break-all font-bold tracking-tight">
              {apiConfig.baseUrl}{endpoint.pathUrl}
            </code>
          </div>

          <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); handleExecute(); }}>

            {/* Parameters Matrix */}
            {(endpoint.operation.parameters || []).length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Parameters</h3>
                {endpoint.operation.parameters!.map(param => (
                  <div key={param.name}>
                    <label className="flex items-center justify-between text-sm font-medium text-slate-700 mb-1.5">
                      <div className="flex items-center gap-2">
                        {param.name}
                        <Badge colour="slate" className="text-[10px] py-0">{param.in}</Badge>
                      </div>
                      {param.required && <span className="text-[10px] uppercase font-bold text-red-500">Required</span>}
                    </label>
                    <input
                      type={param.schema?.type === 'integer' || param.schema?.type === 'number' ? 'number' : 'text'}
                      required={param.required}
                      placeholder={param.description || `Enter ${param.name}...`}
                      value={params[param.name] || ''}
                      onChange={(e) => handleParamChange(param.name, e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Request Body Simulation */}
            {['post', 'put', 'patch'].includes(endpoint.method) && endpoint.operation.requestBody && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Request Body (JSON)</h3>
                <textarea
                  rows={6}
                  className="w-full font-mono text-sm bg-slate-900 text-indigo-300 p-4 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-y"
                  placeholder={"{\n  // Provide valid JSON here\n}"}
                  value={requestBody}
                  onChange={e => setRequestBody(e.target.value)}
                />
              </div>
            )}

            {(endpoint.operation.parameters?.length === 0 || !endpoint.operation.parameters) && !endpoint.operation.requestBody && (
              <div className="py-6 text-center border-2 border-dashed border-slate-100 rounded-xl text-slate-400 text-sm">
                No parameters required to execute this endpoint.
              </div>
            )}

            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-200"
            >
              {mutation.isPending ? <Spinner size="sm" /> : <Play className="w-4 h-4 fill-current" />}
              {mutation.isPending ? 'Executing Request...' : 'Send API Request'}
            </button>
          </form>
        </div>

      </div>

      {/* Right Column: Execution Output */}
      <div className="bg-slate-950 rounded-2xl shadow-xl overflow-hidden flex flex-col border border-slate-800 h-[calc(100vh-8rem)] sticky top-8">
        <div className="h-12 bg-slate-900 border-b border-slate-800 flex items-center px-4 justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
          </div>
          <span className="text-xs font-mono text-slate-500 mr-2">Network Execution Simulator</span>
        </div>

        <div className="flex-1 overflow-auto p-4 md:p-6 text-sm relative">
          {mutation.isIdle && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600 font-mono opacity-50">
              <Activity className="w-12 h-12 mb-4 text-slate-700" />
              Waiting for request compilation...
            </div>
          )}

          {mutation.isPending && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-indigo-400 font-mono">
              <Spinner size="lg" />
              <span className="mt-4 animate-pulse">Running Fetch Headers...</span>
            </div>
          )}

          {mutation.isError && (
            <div className="p-4 bg-red-950/40 border border-red-900/50 rounded-lg text-red-400 font-mono whitespace-pre-wrap">
              [CRITICAL ERROR]
              {'\n'}{mutation.error instanceof Error ? mutation.error.message : 'Network error'}
            </div>
          )}

          {mutation.isSuccess && mutation.data && (
            <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center gap-4 border-b border-slate-800 pb-4">
                <Badge colour={mutation.data.status >= 200 && mutation.data.status < 300 ? 'green' : 'red'} className="text-sm px-3 py-1 font-mono">
                  {mutation.data.status}
                </Badge>
                <span className="text-slate-400 text-xs font-mono break-all">{apiConfig.baseUrl}{availableEndpoints[selectedEndpointIndex].pathUrl}</span>
              </div>

              <div>
                <span className="text-xs text-indigo-400 font-bold uppercase tracking-wider mb-2 block">Response Payload</span>
                <CodeBlock
                  code={typeof mutation.data.data === 'string' ? mutation.data.data : JSON.stringify(mutation.data.data, null, 2)}
                  language="json"
                  copyable={true}
                  className="!bg-slate-900 !border-slate-800/80 !m-0"
                />
              </div>

              {Object.keys(mutation.data.headers).length > 0 && (
                <div>
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2 block">Returned Headers</span>
                  <CodeBlock
                    code={JSON.stringify(mutation.data.headers, null, 2)}
                    language="json"
                    copyable={false}
                    className="!bg-slate-900 !border-slate-800/80 !m-0 text-slate-400"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
