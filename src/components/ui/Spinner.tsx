/**
 * Spinner — reusable loading indicator.
 *
 * Props:
 *  size    — 'sm' | 'md' | 'lg'  (default: 'md')
 *  label   — screen-reader text   (default: 'Loading…')
 *  variant — 'page' | 'inline'   (default: 'inline')
 *            'page' centres inside a full-screen dark bg (used in ProtectedRoute)
 *            'inline' renders just the spinner + label
 */

import { clsx } from 'clsx'

type SpinnerSize = 'sm' | 'md' | 'lg'
type SpinnerVariant = 'inline' | 'page'

const sizeClasses: Record<SpinnerSize, string> = {
  sm: 'w-5 h-5 border-2',
  md: 'w-9 h-9 border-[3px]',
  lg: 'w-14 h-14 border-4',
}

interface SpinnerProps {
  size?: SpinnerSize
  label?: string
  variant?: SpinnerVariant
  className?: string
}

export function Spinner({
  size = 'md',
  label = 'Loading…',
  variant = 'inline',
  className,
}: SpinnerProps) {
  const spinner = (
    <div
      role="status"
      aria-label={label}
      className={clsx('flex flex-col items-center gap-3', className)}
    >
      <div
        className={clsx(
          'rounded-full border-indigo-500 border-t-transparent animate-spin',
          sizeClasses[size],
        )}
      />
      <p className="text-slate-400 text-sm animate-pulse">{label}</p>
    </div>
  )

  if (variant === 'page') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        {spinner}
      </div>
    )
  }

  return spinner
}
