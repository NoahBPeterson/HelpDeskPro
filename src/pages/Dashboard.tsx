import { useAuth } from '../contexts/AuthContext'
import { signOut } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

export function Dashboard() {
  const { session } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    const { error } = await signOut()
    if (!error) {
      navigate('/login')
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-black">Dashboard</h1>
            </div>
            <div className="flex items-center">
              <span className="text-black mr-4">{session?.user.email}</span>
              <button
                onClick={handleSignOut}
                className="bg-red-600 text-black px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 p-4">
            <h2 className="text-2xl font-bold text-black mb-4">Welcome to your Dashboard</h2>
            <p className="text-black">This is a protected page. You can only see this if you're logged in.</p>
          </div>
        </div>
      </main>
    </div>
  )
} 