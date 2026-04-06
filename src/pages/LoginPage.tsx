import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Zap, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { InputField } from '../components/ui'

type Mode = 'login' | 'signup'
const AUTH_MODES: Mode[] = ['login', 'signup']

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { signIn, signUp } = useAuth()

  const from =
    (location.state as { from?: Location })?.from?.pathname || '/docs'

  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [globalError, setGlobalError] = useState('')
  const [loading, setLoading] = useState(false)
  const [signupSuccess, setSignupSuccess] = useState(false)

  function validate(): boolean {
    const errors: Record<string, string> = {}
    if (!email.trim()) errors.email = 'Email is required.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errors.email = 'Enter a valid email address.'
    if (!password) errors.password = 'Password is required.'
    else if (password.length < 8)
      errors.password = 'Password must be at least 8 characters.'
    if (mode === 'signup') {
      if (!confirmPassword)
        errors.confirmPassword = 'Please confirm your password.'
      else if (confirmPassword !== password)
        errors.confirmPassword = 'Passwords do not match.'
    }
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setGlobalError('')
    if (!validate()) return

    setLoading(true)
    try {
      if (mode === 'login') {
        const { error: loginError } = await signIn(email, password)
        if (loginError) {
          setGlobalError(loginError.message)
        } else {
          navigate(from, { replace: true })
        }
      } else {
        const { error: signupError } = await signUp(email, password)
        if (signupError) {
          setGlobalError(signupError.message)
        } else {
          setSignupSuccess(true)
        }
      }
    } finally {
      setLoading(false)
    }
  }

  function switchMode(m: Mode) {
    setMode(m)
    setFieldErrors({})
    setGlobalError('')
    setSignupSuccess(false)
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
          <div className="px-8 pt-8 pb-6 text-center border-b border-slate-800">
            <div className="flex items-center justify-center gap-2.5 mb-5">
              <div className="bg-indigo-500/20 p-2.5 rounded-xl text-indigo-400">
                <Zap className="w-6 h-6" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                Developer Portal
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white">
              {mode === 'login' ? 'Welcome back' : 'Create your account'}
            </h1>
            <p className="text-slate-400 text-sm mt-1.5">
              {mode === 'login'
                ? 'Sign in to access your developer portal'
                : 'Start building with Kulu APIs today'}
            </p>
          </div>

          <div className="flex border-b border-slate-800">
            {AUTH_MODES.map((m) => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  mode === m
                    ? 'text-indigo-400 border-b-2 border-indigo-500 bg-indigo-500/5'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {m === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <div className="px-8 py-7">
            {signupSuccess ? (
              <div className="flex flex-col items-center text-center gap-4 py-4">
                <div className="w-14 h-14 rounded-full bg-green-500/15 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-green-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    Check your email
                  </h2>
                  <p className="text-slate-400 text-sm mt-1.5 max-w-xs">
                    We sent a confirmation link to{' '}
                    <span className="text-indigo-400 font-medium">{email}</span>
                    . Click it to activate your account.
                  </p>
                </div>
                <button
                  onClick={() => switchMode('login')}
                  className="mt-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Back to Sign In →
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                noValidate
                className="flex flex-col gap-5"
              >
                {globalError && (
                  <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-sm text-red-400">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    {globalError}
                  </div>
                )}

                <InputField
                  id="auth-email"
                  label="Email"
                  type="email"
                  value={email}
                  onChange={setEmail}
                  placeholder="you@example.com"
                  error={fieldErrors.email}
                />

                <InputField
                  id="auth-password"
                  label="Password"
                  type="password"
                  value={password}
                  onChange={setPassword}
                  placeholder="••••••••"
                  error={fieldErrors.password}
                />

                {mode === 'signup' && (
                  <InputField
                    id="auth-confirm-password"
                    label="Confirm Password"
                    type="password"
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    placeholder="••••••••"
                    error={fieldErrors.confirmPassword}
                  />
                )}

                <button
                  id="auth-submit"
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-all shadow-lg shadow-indigo-500/20 mt-1"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      {mode === 'login' ? 'Signing in…' : 'Creating account…'}
                    </span>
                  ) : (
                    <>
                      {mode === 'login' ? 'Sign In' : 'Create Account'}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
