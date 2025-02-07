import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom'
import { AuthProvider, UserProvider } from './contexts/AuthContext'
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
import { TeamManagement } from './components/TeamManagement'
import { SessionContextProvider } from '@supabase/auth-helpers-react'
import { supabase } from './lib/supabase'
import { LandingPage } from './pages/LandingPage'
import { TicketProvider } from './contexts/TicketContext'
import { Toaster } from 'react-hot-toast'

function App() {
  return (
    <SessionContextProvider supabaseClient={supabase}>
      <Router>
        <AuthProvider>
          <TicketProvider>
            <UserProvider>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Outlet />
                      </Layout>
                    </ProtectedRoute>
                  }
                >
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/tickets" element={<TicketList />} />
                  <Route path="/create" element={<CreateTicket />} />
                  <Route path="/ticket/:id" element={<ViewTicket />} />
                  <Route path="/invite" element={<InviteUsers />} />
                  <Route path="/teams" element={<TeamManagement />} />
                </Route>
                <Route path="/accept-invite" element={<AcceptInvite />} />
              </Routes>
            </UserProvider>
            <Toaster position="top-right" />
          </TicketProvider>
        </AuthProvider>
      </Router>
    </SessionContextProvider>
  )
}

export default App
