import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { Dashboard } from './pages/Dashboard'
import { Layout } from './components/Layout'
import './App.css'
import { TicketList } from './components/TicketList'
import { CreateTicket } from './components/CreateTicket'
import { ViewTicket } from './components/ViewTicket'
import { InviteUsers } from './components/InviteUsers'
import { AcceptInvite } from "./pages/AcceptInvite"

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/tickets" element={<TicketList />} />
                    <Route path="/create" element={<CreateTicket />} />
                    <Route path="/ticket/:id" element={<ViewTicket />} />
                    <Route path="/invite" element={<InviteUsers />} />
                    <Route path="/accept-invite" element={<AcceptInvite />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
