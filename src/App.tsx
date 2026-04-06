import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthProvider'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { DashboardLayout } from './components/layout/DashboardLayout'
import { QueryProvider } from './components/layout/QueryProvider'
import LoginPage from './pages/LoginPage'
import { ApiDocPage } from './pages/ApiDocPage'
import { SandboxPage } from './pages/SandboxPage'
import { API_REGISTRY } from './apis/api-registry'
import zapIcon from './assets/zap-icon.svg'

function Page({ title, description }: { title: string; description: string }) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">{title}</h1>
      <p className="text-slate-600 mb-8">{description}</p>

      <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm flex flex-col items-center justify-center text-center min-h-[400px]">
        <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4 border border-indigo-100">
          <img src={zapIcon} alt="Development in progress" className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          Development in Progress
        </h3>
        <p className="text-slate-500 max-w-md">
          The {title} module is currently being built. Check back soon for
          updates to the Kulu Developer Portal.
        </p>
      </div>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <QueryProvider>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected routes — all wrapped in DashboardLayout */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Routes>
                      <Route
                        path="/"
                        element={<Navigate to="/docs" replace />}
                      />
                      <Route
                        path="/authentication"
                        element={
                          <Page
                            title="Authentication"
                            description="Manage your API access, configure OAuth, and handle authentication workflows."
                          />
                        }
                      />
                      <Route 
                        path="/docs/:apiId" 
                        element={<ApiDocPage />} 
                      />
                      <Route
                        path="/docs"
                        element={<Navigate to={`/docs/${API_REGISTRY[0]?.id}`} replace />}
                      />
                      <Route
                        path="/sandbox"
                        element={<SandboxPage />}
                      />
                      <Route
                        path="/keys"
                        element={
                          <Page
                            title="API Key Management"
                            description="Generate, rotate, and revoke your API keys and access tokens securely."
                          />
                        }
                      />
                      <Route
                        path="/analytics"
                        element={
                          <Page
                            title="Usage Analytics Dashboard"
                            description="Monitor your API usage, rate limits, and latency metrics."
                          />
                        }
                      />
                      <Route
                        path="/status"
                        element={
                          <Page
                            title="API Status Page"
                            description="View system uptime, historical operational status, and active incidents."
                          />
                        }
                      />
                      <Route
                        path="/changelog"
                        element={
                          <Page
                            title="Changelog"
                            description="Stay up to date with new features, API versions, and breaking changes."
                          />
                        }
                      />
                    </Routes>
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </QueryProvider>
    </BrowserRouter>
  )
}

export default App
