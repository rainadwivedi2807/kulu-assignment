import { useParams, Navigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { API_REGISTRY } from '../apis/api-registry'
import { Badge, Spinner } from '../components/ui'
import { EndpointDetails } from '../components/api-docs/EndpointDetails'
import { ExternalLink, Terminal, History, Book, LayoutDashboard } from 'lucide-react'

// Leverage Vite's powerful glob imports to read all markdown files dynamically
const mdFiles = import.meta.glob('../apis/**/*.md', { query: '?raw', import: 'default' })


async function fetchDocsContent(docsFile: string): Promise<string | null> {
  const normalizedPath = docsFile.replace('./', '../apis/')
  const fetcher = mdFiles[normalizedPath] as (() => Promise<string>) | undefined
  if (!fetcher) return null
  return fetcher()
}

export function ApiDocPage() {
  const { apiId } = useParams<{ apiId: string }>()
  const config = apiId ? API_REGISTRY.find(a => a.id === apiId) : null
  const { data: docsContent, isLoading: isDocsLoading } = useQuery({
    queryKey: ['api-docs', apiId],
    queryFn: () => fetchDocsContent(config!.docsFile!),
    enabled: !!config?.docsFile,
    staleTime: Infinity,
  })

  if (!config) {
    const fallback = API_REGISTRY[0]?.id
    return <Navigate to={fallback ? `/docs/${fallback}` : '/'} replace />
  }

  const schema = config.spec
  const paths = Object.entries(schema.paths || {})

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-500 min-h-screen">
      {/* Header Info */}
      <div className="mb-12 border-b border-slate-200 pb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex flex-wrap items-center gap-4">
          {config.name}
          <Badge colour="purple" className="text-sm font-bold px-3 py-1 border-indigo-200 shadow-sm">
            {config.version}
          </Badge>
          <div className="text-xs font-mono bg-slate-100 text-slate-600 px-3 py-1 rounded-full border border-slate-200 shadow-inner">
            Base URL: {config.baseUrl}
          </div>
        </h1>
        {schema.info.description && (
          <p className="mt-4 text-lg text-slate-600 leading-relaxed max-w-3xl">
            {schema.info.description}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column: Markdown Docs & Endpoints */}
        <div className="lg:col-span-2 space-y-16">
          
          {/* Quickstart Guide — powered by useQuery */}
          {config.docsFile && (
            <section className="prose prose-slate prose-indigo max-w-none">
              <div className="flex items-center gap-2 mb-6 text-slate-900 border-b border-slate-100 pb-2">
                <Book className="w-6 h-6 text-indigo-500" />
                <h2 className="text-2xl font-bold m-0 p-0 line-clamp-1">Quickstart Guide</h2>
              </div>
              {isDocsLoading ? (
                <Spinner size="sm" label="Loading guide…" />
              ) : docsContent ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {docsContent}
                </ReactMarkdown>
              ) : null}
            </section>
          )}

          {/* Endpoints Loop */}
          <section>
            <div className="flex items-center gap-2 mb-8 border-b border-slate-100 pb-2">
              <LayoutDashboard className="w-6 h-6 text-indigo-500" />
              <h2 className="text-2xl font-bold text-slate-900 m-0">API Reference</h2>
            </div>
            
            <div className="space-y-12">
              {paths.map(([pathUrl, pathItem]) => {
                const methods = ['get', 'post', 'put', 'delete', 'patch']
                  .filter((m) => pathItem[m as keyof typeof pathItem])
                
                return methods.map((method) => {
                  const operation = pathItem[method as keyof typeof pathItem]
                  if (!operation) return null
                  return (
                    <EndpointDetails 
                      key={`${method}-${pathUrl}`}
                      path={pathUrl}
                      method={method}
                      operation={operation}
                    />
                  )
                })
              })}
            </div>
          </section>
        </div>

        {/* Right Column: SDKs & Changelog */}
        <div className="space-y-8 sticky top-24">
          
          {/* SDK Links */}
          {config.sdks && config.sdks.length > 0 && (
            <div className="bg-slate-50/80 rounded-xl p-6 border border-slate-200/60 shadow-sm backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-4 text-slate-800 border-b border-slate-200/60 pb-2">
                <Terminal className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold">Official SDKs</h3>
              </div>
              <ul className="space-y-4">
                {config.sdks.map((sdk, idx) => (
                  <li key={idx} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                       <span className="font-semibold text-slate-700 text-sm">
                        {sdk.lang}
                       </span>
                       <a href={sdk.repo} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-500">
                         <ExternalLink className="w-4 h-4" />
                       </a>
                    </div>
                    <code className="text-[11px] font-mono bg-slate-200/50 text-slate-600 px-2 py-1 rounded select-all border border-slate-200/50">
                      {sdk.install}
                    </code>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Changelog */}
          {config.changelog && config.changelog.length > 0 && (
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4 text-slate-800 border-b border-slate-100 pb-2">
                <History className="w-5 h-5 text-indigo-500" />
                <h3 className="font-bold">Recent Updates</h3>
              </div>
              <div className="space-y-5">
                 {config.changelog.slice(0, 3).map((cl, i) => (
                   <div key={i} className="flex flex-col gap-1.5 flex-shrink-0 min-w-0">
                     <div className="flex items-baseline justify-between overflow-hidden">
                       <Badge colour="slate" className="text-[10px] uppercase font-bold py-0.5 whitespace-nowrap">{cl.version}</Badge>
                       <span className="text-[11px] font-mono text-slate-400 pl-2 whitespace-nowrap">{cl.date}</span>
                     </div>
                     <ul className="text-xs text-slate-600 list-disc list-inside space-y-1 ml-1 mt-1">
                       {cl.changes.map((change, c) => (
                         <li key={c} className="leading-relaxed truncate">{change}</li>
                       ))}
                     </ul>
                   </div>
                 ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
