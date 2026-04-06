/**
 * Badge — HTTP method badge + status code badge.
 *
 * The colour convention follows industry standards:
 *   GET     → green
 *   POST    → blue
 *   PUT     → amber
 *   PATCH   → orange
 *   DELETE  → red
 *
 * HTTP status codes:
 *   2xx → green
 *   3xx → blue
 *   4xx → amber
 *   5xx → red
 */

import { clsx } from 'clsx'

// ─── HTTP Method badge ──────────────────────────────────────────────

type HttpMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'DELETE'
  | 'HEAD'
  | 'OPTIONS'

const methodColours: Record<HttpMethod, string> = {
  GET: 'bg-emerald-50  text-emerald-700  border-emerald-200',
  POST: 'bg-blue-50     text-blue-700     border-blue-200',
  PUT: 'bg-amber-50    text-amber-700    border-amber-200',
  PATCH: 'bg-orange-50   text-orange-700   border-orange-200',
  DELETE: 'bg-red-50      text-red-700      border-red-200',
  HEAD: 'bg-slate-50    text-slate-600    border-slate-200',
  OPTIONS: 'bg-purple-50   text-purple-700   border-purple-200',
}

interface MethodBadgeProps {
  method: string
  className?: string
}

export function MethodBadge({ method, className }: MethodBadgeProps) {
  const upper = method.toUpperCase() as HttpMethod
  const colours =
    methodColours[upper] ?? 'bg-slate-50 text-slate-600 border-slate-200'
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2 py-0.5 rounded text-xs font-bold font-mono border tracking-wide',
        colours,
        className,
      )}
    >
      {upper}
    </span>
  )
}

// ─── Status code badge ──────────────────────────────────────────────

function statusColour(code: number): string {
  if (code >= 500) return 'bg-red-50    text-red-700    border-red-200'
  if (code >= 400) return 'bg-amber-50  text-amber-700  border-amber-200'
  if (code >= 300) return 'bg-blue-50   text-blue-700   border-blue-200'
  if (code >= 200) return 'bg-emerald-50 text-emerald-700 border-emerald-200'
  return 'bg-slate-50 text-slate-600 border-slate-200'
}

interface StatusBadgeProps {
  code: number
  label?: string
  className?: string
}

export function StatusBadge({ code, label, className }: StatusBadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold font-mono border',
        statusColour(code),
        className,
      )}
    >
      {code}
      {label && <span className="font-normal opacity-70">{label}</span>}
    </span>
  )
}

// ─── Generic coloured badge ─────────────────────────────────────────

type BadgeColour = 'green' | 'blue' | 'amber' | 'red' | 'purple' | 'slate'

const genericColours: Record<BadgeColour, string> = {
  green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  blue: 'bg-blue-50    text-blue-700    border-blue-200',
  amber: 'bg-amber-50   text-amber-700   border-amber-200',
  red: 'bg-red-50     text-red-700     border-red-200',
  purple: 'bg-purple-50  text-purple-700  border-purple-200',
  slate: 'bg-slate-50   text-slate-600   border-slate-200',
}

interface BadgeProps {
  children: React.ReactNode
  colour?: BadgeColour
  className?: string
}

export function Badge({ children, colour = 'slate', className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border',
        genericColours[colour],
        className,
      )}
    >
      {children}
    </span>
  )
}
