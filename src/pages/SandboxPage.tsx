import { useState, useMemo, useCallback } from 'react'
import { useMutation } from '@tanstack/react-query'
import { API_REGISTRY } from '../apis/api-registry'
import { Badge, CodeBlock, Spinner } from '../components/ui'
import { Play, Activity, Clock, Copy, Check, ChevronDown, Globe } from 'lucide-react'
import type { OpenAPIOperation } from '../types/openapi'
import { useAuth } from '../context/useAuth'

// Editor: CodeMirror 6
import CodeMirror from '@uiw/react-codemirror'
import { json } from '@codemirror/lang-json'
import { oneDark } from '@codemirror/theme-one-dark'

/* ── Types ────────────────────────────────────────────────── */

type Environment = 'sandbox' | 'staging' | 'production'

interface SandboxResponse {
  status: number
  data: unknown
  headers: Record<string, string>
  latencyMs: number
  requestUrl: string
}

interface SandboxRequest {
  baseUrl: string
  pathUrl: string
  method: string
  params: Record<string, string>
  parameters: OpenAPIOperation['parameters']
  requestBody?: string
  customHeaders: Record<string, string>
  authToken?: string
  environment?: Environment
}

/* ── Environment Config ───────────────────────────────────── */

const ENV_CONFIG: Record<Environment, { label: string; colour: string; suffix: string }> = {
  sandbox:    { label: 'Sandbox',    colour: 'bg-amber-500',  suffix: '' },
  staging:    { label: 'Staging',    colour: 'bg-blue-500',   suffix: '/staging' },
  production: { label: 'Production', colour: 'bg-emerald-500', suffix: '' },
}

/* ── Snippet Generators ───────────────────────────────────── */

function generateCurl(url: string, method: string, headers: Record<string, string>, body?: string): string {
  let cmd = `curl -X ${method.toUpperCase()} '${url}'`
  for (const [k, v] of Object.entries(headers)) {
    cmd += ` \\\n  -H '${k}: ${v}'`
  }
  if (body) {
    cmd += ` \\\n  -d '${body}'`
  }
  return cmd
}

function generateFetchJs(url: string, method: string, headers: Record<string, string>, body?: string): string {
  const opts: string[] = [`  method: '${method.toUpperCase()}'`]
  const headerEntries = Object.entries(headers)
  if (headerEntries.length > 0) {
    const hdr = headerEntries.map(([k, v]) => `    '${k}': '${v}'`).join(',\n')
    opts.push(`  headers: {\n${hdr}\n  }`)
  }
  if (body) opts.push(`  body: JSON.stringify(${body})`)
  return `const response = await fetch('${url}', {\n${opts.join(',\n')}\n});\nconst data = await response.json();\nconsole.log(data);`
}

function generatePython(url: string, method: string, headers: Record<string, string>, body?: string): string {
  let code = `import requests\n\n`
  const hdr = Object.entries(headers).map(([k, v]) => `    '${k}': '${v}'`).join(',\n')
  code += `headers = {\n${hdr}\n}\n\n`
  if (body) {
    code += `payload = ${body}\n\n`
    code += `response = requests.${method.toLowerCase()}(\n    '${url}',\n    headers=headers,\n    json=payload\n)\n`
  } else {
    code += `response = requests.${method.toLowerCase()}(\n    '${url}',\n    headers=headers\n)\n`
  }
  code += `print(response.status_code)\nprint(response.json())`
  return code
}

/* ── Request Executor ─────────────────────────────────────── */

async function executeApiRequest(req: SandboxRequest): Promise<SandboxResponse> {
  let finalPath = req.pathUrl
  const queryParams = new URLSearchParams()
  const headers: Record<string, string> = {
    'Accept': 'application/json',
    ...req.customHeaders,
  }

  // Inject x-env header per environment
  if (req.environment) {
    headers['x-env'] = req.environment
  }

  if (req.authToken) {
    headers['Authorization'] = `Bearer ${req.authToken}`
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

  const t0 = performance.now()
  const res = await fetch(fullUrl, fetchOptions)
  const latencyMs = Math.round(performance.now() - t0)

  let data: unknown
  const text = await res.text()
  try {
    data = JSON.parse(text)
  } catch {
    data = text
  }

  const responseHeaders: Record<string, string> = {}
  res.headers.forEach((val, key) => {
    responseHeaders[key] = val
  })

  return { status: res.status, data, headers: responseHeaders, latencyMs, requestUrl: fullUrl }
}

/* ── Snippet Tab Component ────────────────────────────────── */

type SnippetLang = 'curl' | 'javascript' | 'python'
const SNIPPET_TABS: { id: SnippetLang; label: string }[] = [
  { id: 'curl', label: 'cURL' },
  { id: 'javascript', label: 'JavaScript' },
  { id: 'python', label: 'Python' },
]

function SnippetPanel({ url, method, headers, body }: { url: string; method: string; headers: Record<string, string>; body?: string }) {
  const [activeLang, setActiveLang] = useState<SnippetLang>('curl')
  const [copied, setCopied] = useState(false)

  const snippet = useMemo(() => {
    switch (activeLang) {
      case 'curl': return generateCurl(url, method, headers, body)
      case 'javascript': return generateFetchJs(url, method, headers, body)
      case 'python': return generatePython(url, method, headers, body)
    }
  }, [activeLang, url, method, headers, body])

  const handleCopy = useCallback(() => {
    void navigator.clipboard.writeText(snippet).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [snippet])

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-2">
        <div className="flex gap-1">
          {SNIPPET_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveLang(tab.id); setCopied(false) }}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeLang === tab.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-indigo-600 transition-colors"
        >
          {copied ? <><Check className="w-3.5 h-3.5 text-emerald-500" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-[13px] leading-relaxed text-slate-800 font-mono bg-white max-h-52 overflow-y-auto">
        <code>{snippet}</code>
      </pre>
    </div>
  )
}
export function SandboxPage() {
  const { session } = useAuth()
  const authToken = session?.access_token

  const [selectedApiId, setSelectedApiId] = useState<string>(API_REGISTRY[0]?.id || '')
  const [environment, setEnvironment] = useState<Environment>(() => {
    const saved = localStorage.getItem('env') as Environment | null
    return saved && saved in ENV_CONFIG ? saved : 'sandbox'
  })
  const [showEnvDropdown, setShowEnvDropdown] = useState(false)

  const apiConfig = useMemo(() => API_REGISTRY.find(a => a.id === selectedApiId), [selectedApiId])
  const spec = apiConfig?.spec
  const effectiveBaseUrl = (apiConfig?.baseUrl || '') + ENV_CONFIG[environment].suffix

  const availableEndpoints = useMemo(() => {
    if (!spec?.paths) return []
    const list: { pathUrl: string; method: string; operation: OpenAPIOperation }[] = []
    for (const [pathUrl, pathItem] of Object.entries(spec.paths)) {
      for (const method of ['get', 'post', 'put', 'delete', 'patch']) {
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
  const [customHeaders, setCustomHeaders] = useState<Record<string, string>>({})
  const [newHeaderKey, setNewHeaderKey] = useState('')
  const [newHeaderValue, setNewHeaderValue] = useState('')

  const mutation = useMutation({ mutationFn: executeApiRequest })

  const handleApiChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedApiId(e.target.value)
    setSelectedEndpointIndex(0)
    setParams({})
    setRequestBody('')
    setCustomHeaders({})
    mutation.reset()
  }

  const handleEndpointChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedEndpointIndex(Number(e.target.value))
    setParams({})
    setRequestBody('')
    mutation.reset()
  }

  const addHeader = () => {
    if (!newHeaderKey.trim()) return
    setCustomHeaders(prev => ({ ...prev, [newHeaderKey]: newHeaderValue }))
    setNewHeaderKey('')
    setNewHeaderValue('')
  }

  const removeHeader = (key: string) => {
    setCustomHeaders(prev => {
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  const handleExecute = () => {
    if (!apiConfig || !endpoint) return
    mutation.mutate({
      baseUrl: effectiveBaseUrl,
      pathUrl: endpoint.pathUrl,
      method: endpoint.method,
      params,
      parameters: endpoint.operation.parameters,
      requestBody: ['post', 'put', 'patch'].includes(endpoint.method) ? requestBody : undefined,
      customHeaders,
      authToken: authToken || undefined,
      environment,
    })
  }

  // Build the current request URL for snippet generation
  const currentRequestUrl = useMemo(() => {
    if (!endpoint) return ''
    let finalPath = endpoint.pathUrl
    const qp = new URLSearchParams()
    for (const param of endpoint.operation.parameters || []) {
      const val = params[param.name]
      if (!val) continue
      if (param.in === 'path') finalPath = finalPath.replace(`{${param.name}}`, encodeURIComponent(val))
      else if (param.in === 'query') qp.append(param.name, val)
    }
    const qs = qp.toString()
    return `${effectiveBaseUrl}${finalPath}${qs ? `?${qs}` : ''}`
  }, [endpoint, params, effectiveBaseUrl])

  const currentHeaders = useMemo(() => {
    const h: Record<string, string> = { 'Accept': 'application/json', 'x-env': environment, ...customHeaders }
    if (authToken) h['Authorization'] = `Bearer ${authToken}`
    if (['post', 'put', 'patch'].includes(endpoint?.method || '') && requestBody) h['Content-Type'] = 'application/json'
    return h
  }, [customHeaders, authToken, endpoint?.method, requestBody, environment])

  if (!apiConfig || !endpoint) return <div className="p-8 text-slate-500">Loading sandbox...</div>

  return (
    <div className="max-w-7xl mx-auto py-8 animate-in fade-in duration-500 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Activity className="w-8 h-8 text-indigo-500" />
            Interactive Sandbox
            <span className={`ml-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white shadow-sm ${ENV_CONFIG[environment].colour}`}>
              ENV: {ENV_CONFIG[environment].label}
            </span>
          </h1>
          <p className="text-slate-500 mt-1">Fire real API requests and inspect responses in real-time.</p>
        </div>

        {/* Environment Toggle */}
        <div className="relative">
          <button
            onClick={() => setShowEnvDropdown(!showEnvDropdown)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm hover:border-slate-300 transition-colors text-sm font-medium text-slate-700"
          >
            <span className={`w-2.5 h-2.5 rounded-full ${ENV_CONFIG[environment].colour}`} />
            {ENV_CONFIG[environment].label}
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>
          {showEnvDropdown && (
            <div className="absolute right-0 mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden animate-in slide-in-from-top-2 duration-150">
              {(Object.keys(ENV_CONFIG) as Environment[]).map(env => (
                <button
                  key={env}
                  onClick={() => { setEnvironment(env); localStorage.setItem('env', env); setShowEnvDropdown(false); mutation.reset() }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-left hover:bg-slate-50 transition-colors ${
                    environment === env ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-700'
                  }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${ENV_CONFIG[env].colour}`} />
                  {ENV_CONFIG[env].label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* ── Left Column: Request Builder ──────────────── */}
        <div className="space-y-6">
          {/* API & Endpoint Selectors */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Target API</label>
              <select value={selectedApiId} onChange={handleApiChange}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 p-2.5"
              >
                {API_REGISTRY.map(api => (
                  <option key={api.id} value={api.id}>{api.name} ({api.version})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Endpoint</label>
              <select value={selectedEndpointIndex} onChange={handleEndpointChange}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 p-2.5 cursor-pointer"
              >
                {availableEndpoints.map((ep, idx) => (
                  <option key={idx} value={idx}>
                    {ep.method.toUpperCase()} {ep.pathUrl} — {ep.operation.summary || 'Endpoint'}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
              <Globe className="w-4 h-4 text-slate-400" />
              <code className="text-xs font-mono text-slate-500 break-all">{effectiveBaseUrl}{endpoint.pathUrl}</code>
            </div>
          </div>

          {/* Parameters */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-5">
            <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); handleExecute() }}>

              {/* Path / Query Params */}
              {(endpoint.operation.parameters || []).length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Parameters</h3>
                  {endpoint.operation.parameters!.map(param => (
                    <div key={param.name}>
                      <label className="flex items-center justify-between text-sm font-medium text-slate-700 mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono">{param.name}</span>
                          <Badge colour="slate" className="text-[10px] py-0">{param.in}</Badge>
                        </div>
                        {param.required && <span className="text-[10px] uppercase font-bold text-red-500">Required</span>}
                      </label>
                      <input
                        type={param.schema?.type === 'integer' || param.schema?.type === 'number' ? 'number' : 'text'}
                        required={param.required}
                        placeholder={param.description || `Enter ${param.name}...`}
                        value={params[param.name] || ''}
                        onChange={(e) => setParams(prev => ({ ...prev, [param.name]: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 p-2.5"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Custom Headers */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Custom Headers</h3>
                {authToken && (
                  <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 text-xs text-emerald-700">
                    <Check className="w-3.5 h-3.5" /> Auth token auto-injected from session
                  </div>
                )}
                {Object.entries(customHeaders).map(([k, v]) => (
                  <div key={k} className="flex items-center gap-2">
                    <code className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-mono truncate">
                      {k}: {v}
                    </code>
                    <button onClick={() => removeHeader(k)} className="text-red-400 hover:text-red-600 text-xs font-bold px-2">✕</button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <input placeholder="Header name" value={newHeaderKey} onChange={e => setNewHeaderKey(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 text-sm rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <input placeholder="Value" value={newHeaderValue} onChange={e => setNewHeaderValue(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 text-sm rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <button type="button" onClick={addHeader}
                    className="px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
                  >Add</button>
                </div>
              </div>

              {/* Request Body */}
              {['post', 'put', 'patch'].includes(endpoint.method) && endpoint.operation.requestBody && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Request Body (JSON)</h3>
                    <button 
                      type="button"
                      onClick={() => {
                        try {
                          const parsed = JSON.parse(requestBody);
                          setRequestBody(JSON.stringify(parsed, null, 2));
                        } catch {
                          // Ignore if invalid JSON
                        }
                      }}
                      className="text-[10px] font-black text-indigo-500 uppercase hover:underline"
                    >
                      Prettify JSON
                    </button>
                  </div>
                  <div className="rounded-xl overflow-hidden border border-slate-800 shadow-lg">
                    <CodeMirror
                      value={requestBody}
                      height="240px"
                      theme={oneDark}
                      extensions={[json()]}
                      onChange={(value) => setRequestBody(value)}
                      className="text-sm font-mono"
                    />
                  </div>
                </div>
              )}

              {(endpoint.operation.parameters?.length === 0 || !endpoint.operation.parameters) && !endpoint.operation.requestBody && (
                <div className="py-6 text-center border-2 border-dashed border-slate-100 rounded-xl text-slate-400 text-sm">
                  No parameters required to execute this endpoint.
                </div>
              )}

              <button type="submit" disabled={mutation.isPending}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-200"
              >
                <Play className="w-4 h-4 fill-current" />
                Send Request
              </button>
            </form>
          </div>

          {/* Code Snippet Generator */}
          <SnippetPanel
            url={currentRequestUrl}
            method={endpoint.method}
            headers={currentHeaders}
            body={['post', 'put', 'patch'].includes(endpoint.method) && requestBody ? requestBody : undefined}
          />
        </div>

        {/* ── Right Column: Response Terminal ───────────── */}
        <div className="bg-slate-950 rounded-2xl shadow-xl overflow-hidden flex flex-col border border-slate-800 h-[calc(100vh-8rem)] sticky top-8">
          <div className="h-12 bg-slate-900 border-b border-slate-800 flex items-center px-4 justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
            <div className="flex items-center gap-3">
              <span className={`w-2 h-2 rounded-full ${ENV_CONFIG[environment].colour}`} />
              <span className="text-xs font-mono text-slate-500">{ENV_CONFIG[environment].label} Console</span>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-4 md:p-6 text-sm relative">
            {mutation.isIdle && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600 font-mono opacity-50">
                <Activity className="w-12 h-12 mb-4 text-slate-700" />
                Waiting for request...
              </div>
            )}

            {mutation.isPending && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-indigo-400 font-mono">
                <Spinner size="lg" />
                <span className="mt-4 animate-pulse">Executing request...</span>
              </div>
            )}

            {mutation.isError && (
              <div className="p-4 bg-red-950/40 border border-red-900/50 rounded-lg text-red-400 font-mono whitespace-pre-wrap">
                [ERROR] {mutation.error instanceof Error ? mutation.error.message : 'Network error'}
              </div>
            )}

            {mutation.isSuccess && mutation.data && (
              <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
                {/* Status + Latency Bar */}
                <div className="flex items-center gap-4 border-b border-slate-800 pb-4 flex-wrap">
                  <Badge colour={mutation.data.status >= 200 && mutation.data.status < 300 ? 'green' : 'red'} className="text-sm px-3 py-1 font-mono">
                    {mutation.data.status}
                  </Badge>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                    <Clock className="w-3.5 h-3.5" />
                    {mutation.data.latencyMs}ms
                  </div>
                  <span className="text-slate-600 text-xs font-mono break-all">{mutation.data.requestUrl}</span>
                </div>

                <div>
                  <span className="text-xs text-indigo-400 font-bold uppercase tracking-wider mb-2 block">Response</span>
                  <CodeBlock
                    code={typeof mutation.data.data === 'string' ? mutation.data.data : JSON.stringify(mutation.data.data, null, 2)}
                    language="json"
                    copyable={true}
                    className="!bg-slate-900 !border-slate-800/80 !m-0"
                  />
                </div>

                {Object.keys(mutation.data.headers).length > 0 && (
                  <div>
                    <span className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2 block">Response Headers</span>
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
    </div>
  )
}
