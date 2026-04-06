/**
 * CodeBlock — syntax-highlighted code display primitive.
 *
 * Intentionally lightweight (no external syntax-highlighter dep) —
 * renders code in a styled pre/code block with copy-to-clipboard.
 * Swap out for shiki/prism-react-renderer later without touching callers.
 */

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { clsx } from 'clsx'

interface CodeBlockProps {
  code: string
  language?: string
  /** Show the copy button (default: true) */
  copyable?: boolean
  className?: string
}

export function CodeBlock({
  code,
  language,
  copyable = true,
  className,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    void navigator.clipboard.writeText(code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div
      className={clsx(
        'relative rounded-lg bg-slate-900 border border-slate-700 overflow-hidden',
        className,
      )}
    >
      {/* toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-700 bg-slate-800">
        {language && (
          <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">
            {language}
          </span>
        )}
        {copyable && (
          <button
            onClick={handleCopy}
            aria-label="Copy code"
            className="ml-auto flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copy
              </>
            )}
          </button>
        )}
      </div>
      {/* code */}
      <pre className="overflow-x-auto p-4 text-sm leading-relaxed text-slate-200 font-mono">
        <code>{code}</code>
      </pre>
    </div>
  )
}
