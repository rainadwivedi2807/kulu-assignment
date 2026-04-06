import { useState } from 'react'
import { MethodBadge, StatusBadge, CodeBlock, Badge } from '../ui'
import type { OpenAPIOperation } from '../../types/openapi'

interface EndpointDetailsProps {
  path: string
  method: string
  operation: OpenAPIOperation
}

export function EndpointDetails({ path, method, operation }: EndpointDetailsProps) {
  const [activeTab, setActiveTab] = useState<'parameters' | 'responses'>('parameters')
  
  const parameters = operation.parameters || []
  const requestBody = operation.requestBody
  const responses = Object.entries(operation.responses || {})

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-8">
      <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-3">
            <MethodBadge method={method} />
            <code className="text-sm font-bold text-slate-800 font-mono tracking-tight">{path}</code>
          </div>
          {operation.summary && (
            <h3 className="text-sm font-semibold text-slate-900 mt-1">{operation.summary}</h3>
          )}
        </div>
      </div>

      <div className="p-6">
        {operation.description && (
          <p className="text-sm text-slate-600 leading-relaxed mb-6">
            {operation.description}
          </p>
        )}

        {/* Dynamic Tabs */}
        <div className="flex items-center gap-6 border-b border-slate-200 mb-6">
          {(parameters.length > 0 || requestBody) && (
            <button
              onClick={() => setActiveTab('parameters')}
              className={`pb-3 text-sm font-semibold transition-colors ${
                activeTab === 'parameters'
                  ? 'border-b-2 border-indigo-500 text-indigo-600'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Request Schema
            </button>
          )}
          {responses.length > 0 && (
            <button
              onClick={() => setActiveTab('responses')}
              className={`pb-3 text-sm font-semibold transition-colors ${
                activeTab === 'responses'
                  ? 'border-b-2 border-indigo-500 text-indigo-600'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Responses
            </button>
          )}
        </div>

        {/* Tab Content: Parameters */}
        {activeTab === 'parameters' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {parameters.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Parameters</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 rounded-lg">
                        <th className="px-4 py-2 font-medium rounded-l-lg">Name</th>
                        <th className="px-4 py-2 font-medium">In</th>
                        <th className="px-4 py-2 font-medium">Type</th>
                        <th className="px-4 py-2 font-medium rounded-r-lg w-full">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {parameters.map((p, i) => (
                        <tr key={i} className="hover:bg-slate-50/50">
                          <td className="px-4 py-3 font-mono font-medium text-slate-900 border-l-2 border-transparent">
                            {p.name}
                            {p.required && <span className="ml-2 text-[10px] text-red-500 font-bold uppercase">Required</span>}
                          </td>
                          <td className="px-4 py-3 text-slate-500 font-mono text-xs">{p.in}</td>
                          <td className="px-4 py-3 text-indigo-600 font-mono text-xs">{p.schema?.type || 'string'}</td>
                          <td className="px-4 py-3 text-slate-500 whitespace-normal">{p.description || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {requestBody && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Request Body</h4>
                {Object.entries(requestBody.content).map(([contentType, contentObj]) => (
                  <div key={contentType} className="border border-slate-200 rounded-lg overflow-hidden">
                    <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex justify-between items-center">
                      <span className="text-xs font-mono font-semibold text-slate-600">{contentType}</span>
                      {requestBody.required && (
                        <Badge colour="red" className="text-[10px] py-0.5">Required</Badge>
                      )}
                    </div>
                    <div className="p-0">
                      <CodeBlock 
                        code={JSON.stringify(contentObj.schema, null, 2)} 
                        language="json" 
                        copyable={false}
                        className="rounded-none border-x-0 border-b-0 border-t-0"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {parameters.length === 0 && !requestBody && (
              <p className="text-sm text-slate-500 italic">This endpoint does not require any parameters or request body.</p>
            )}
          </div>
        )}

        {/* Tab Content: Responses */}
        {activeTab === 'responses' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {responses.map(([code, response]) => (
              <div key={code} className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <StatusBadge code={parseInt(code)} />
                    <span className="text-sm font-medium text-slate-700">{response.description}</span>
                  </div>
                </div>
                {response.content && (
                  <div className="p-0 border-t-0">
                    {Object.entries(response.content).map(([contentType, mediaType]) => (
                      <div key={contentType}>
                        <div className="bg-slate-100 px-4 py-1 border-b border-slate-200">
                           <span className="text-xs font-mono text-slate-500">{contentType}</span>
                        </div>
                        <CodeBlock 
                          code={JSON.stringify(mediaType.schema, null, 2)} 
                          language="json" 
                          copyable={true}
                          className="rounded-none border-x-0 border-b-0 border-t-0"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
