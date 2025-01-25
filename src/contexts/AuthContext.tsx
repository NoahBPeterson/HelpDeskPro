import { createContext, useContext, useEffect, useState, useMemo } from 'react'
import { Session } from '@supabase/supabase-js'
import { getSession, onAuthStateChange, supabase } from '../lib/supabase'
import { useSessionContext, useUser as useSupaUser } from '@supabase/auth-helpers-react'
import type { User } from '@supabase/supabase-js'
import type { UserRole } from '../types/users'

interface AuthContextType {
  session: Session | null
  loading: boolean
}

export const AuthContext = createContext<AuthContextType>({
  session: null,
  loading: true,
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    getSession().then(({ session }) => {
      setSession(session)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = onAuthStateChange((_, session) => {
      setSession(session)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <AuthContext.Provider value={{ session, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

type UserContextType = {
  user: User | null
  role: UserRole | null
  isLoading: boolean
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { isLoading } = useSessionContext()
  const supabaseUser = useSupaUser()
  const [userData, setUserData] = useState<{ role: UserRole } | null>(null)
  const [isLoadingUserData, setIsLoadingUserData] = useState(true)

  console.log('UserProvider dependencies:', { 
    isLoading, 
    supabaseUser: supabaseUser?.id, // Just log the ID to keep it clean
    userData: userData?.role,
    isLoadingUserData 
  });

  useEffect(() => {
    console.log('UserProvider useEffect running');
    const fetchUserData = async () => {
      console.log('fetchUserData running');
      if (!supabaseUser?.id) {
        setIsLoadingUserData(false)
        return
      }

      try {
        console.log('Fetching user data from Supabase');
        const { data, error } = await supabase
          .from('users')
          .select('role')
          .eq('id', supabaseUser.id)
          .single()

        if (!error && data) {
          console.log('Setting user data with role:', data.role);
          setUserData({ role: data.role as UserRole })
        } else {
          setUserData(null);
        }
      } catch (err) {
        console.error('Error fetching user data:', err)
        setUserData(null);
      } finally {
        setIsLoadingUserData(false)
      }
    }

    fetchUserData()
  }, [supabaseUser?.id])

  const value = useMemo(() => {
    console.log('UserProvider value memo recalculation');
    return {
      user: supabaseUser,
      role: userData?.role || null,
      isLoading: isLoading || isLoadingUserData
    };
  }, [supabaseUser, userData?.role, isLoading, isLoadingUserData]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export const useUser = () => {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
} 