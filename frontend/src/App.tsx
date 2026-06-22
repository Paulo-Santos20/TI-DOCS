import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import MainLayout from './components/layout/MainLayout'
import ErrorBoundary from './components/ErrorBoundary'
import LoadingSpinner from './components/ui/LoadingSpinner'

const Login = lazy(() => import('./pages/Login'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Documents = lazy(() => import('./pages/Documents'))
const DocumentView = lazy(() => import('./pages/DocumentView'))
const DocumentVersions = lazy(() => import('./pages/DocumentVersions'))
const Admin = lazy(() => import('./pages/Admin'))
const AdminUsers = lazy(() => import('./pages/AdminUsers'))
const AdminSectors = lazy(() => import('./pages/AdminSectors'))
const AdminCategories = lazy(() => import('./pages/AdminCategories'))
const AdminAssignments = lazy(() => import('./pages/AdminAssignments'))
const AdminAudit = lazy(() => import('./pages/AdminAudit'))
const AdminSettings = lazy(() => import('./pages/AdminSettings'))
const Reports = lazy(() => import('./pages/Reports'))
const Templates = lazy(() => import('./pages/Templates'))
const SearchResults = lazy(() => import('./pages/SearchResults'))
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'))
const Profile = lazy(() => import('./pages/Profile'))
const NotFound = lazy(() => import('./pages/NotFound'))

function ProtectedRoute({ children, requireRole }: { children: React.ReactNode; requireRole?: string }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingSpinner />
  if (!user) return <Navigate to="/login" replace />
  if (requireRole && user.role !== requireRole) return <Navigate to="/" replace />
  return <>{children}</>
}

function SuspenseWrapper({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
}

export default function App() {
  const { user, loading } = useAuth()

  if (loading) return <LoadingSpinner />

  return (
    <ErrorBoundary>
      <SuspenseWrapper>
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
          <Route path="/" element={<ProtectedRoute><MainLayout><Dashboard /></MainLayout></ProtectedRoute>} />
          <Route path="/documentos" element={<ProtectedRoute><MainLayout><Documents /></MainLayout></ProtectedRoute>} />
          <Route path="/documentos/:id" element={<ProtectedRoute><MainLayout><DocumentView /></MainLayout></ProtectedRoute>} />
          <Route path="/documentos/:id/versoes" element={<ProtectedRoute><MainLayout><DocumentVersions /></MainLayout></ProtectedRoute>} />
          <Route path="/modelos" element={<ProtectedRoute><MainLayout><Templates /></MainLayout></ProtectedRoute>} />
          <Route path="/busca" element={<ProtectedRoute><MainLayout><SearchResults /></MainLayout></ProtectedRoute>} />
          <Route path="/relatorios" element={<ProtectedRoute><MainLayout><Reports /></MainLayout></ProtectedRoute>} />
          <Route path="/notificacoes" element={<ProtectedRoute><MainLayout><NotificationsPage /></MainLayout></ProtectedRoute>} />
          <Route path="/perfil" element={<ProtectedRoute><MainLayout><Profile /></MainLayout></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute requireRole="admin"><MainLayout><Admin /></MainLayout></ProtectedRoute>} />
          <Route path="/admin/usuarios" element={<ProtectedRoute requireRole="admin"><MainLayout><AdminUsers /></MainLayout></ProtectedRoute>} />
          <Route path="/admin/setores" element={<ProtectedRoute requireRole="admin"><MainLayout><AdminSectors /></MainLayout></ProtectedRoute>} />
          <Route path="/admin/categorias" element={<ProtectedRoute requireRole="admin"><MainLayout><AdminCategories /></MainLayout></ProtectedRoute>} />
          <Route path="/admin/atribuicoes" element={<ProtectedRoute requireRole="admin"><MainLayout><AdminAssignments /></MainLayout></ProtectedRoute>} />
          <Route path="/admin/auditoria" element={<ProtectedRoute requireRole="admin"><MainLayout><AdminAudit /></MainLayout></ProtectedRoute>} />
          <Route path="/admin/configuracoes" element={<ProtectedRoute requireRole="admin"><MainLayout><AdminSettings /></MainLayout></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </SuspenseWrapper>
    </ErrorBoundary>
  )
}
