import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Documents from './pages/Documents'
import DocumentView from './pages/DocumentView'
import DocumentVersions from './pages/DocumentVersions'
import Admin from './pages/Admin'
import AdminUsers from './pages/AdminUsers'
import AdminSectors from './pages/AdminSectors'
import AdminCategories from './pages/AdminCategories'
import AdminAssignments from './pages/AdminAssignments'
import AdminAudit from './pages/AdminAudit'
import AdminSettings from './pages/AdminSettings'
import Reports from './pages/Reports'
import Templates from './pages/Templates'
import SearchResults from './pages/SearchResults'
import NotificationsPage from './pages/NotificationsPage'
import Profile from './pages/Profile'
import NotFound from './pages/NotFound'
import MainLayout from './components/layout/MainLayout'
import ErrorBoundary from './components/ErrorBoundary'
import LoadingSpinner from './components/ui/LoadingSpinner'

function ProtectedRoute({ children, requireRole }: { children: React.ReactNode; requireRole?: string }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingSpinner />
  if (!user) return <Navigate to="/login" replace />
  if (requireRole && user.role !== requireRole) return <Navigate to="/" replace />
  return <>{children}</>
}

export default function App() {
  const { user, loading } = useAuth()

  if (loading) return <LoadingSpinner />

  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  )
}
