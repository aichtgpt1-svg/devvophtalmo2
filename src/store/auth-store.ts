import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { auth } from '@devvai/devv-code-backend'
import { databaseService } from '@/services/database-service'

interface User {
  projectId: string
  uid: string
  name: string
  email: string
  createdTime: number
  lastLoginTime: number
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  userId?: string
  
  // Actions
  sendOTP: (email: string) => Promise<void>
  verifyOTP: (email: string, code: string) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
  getCurrentUserId: () => string | null
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      userId: undefined,

      sendOTP: async (email: string) => {
        set({ isLoading: true })
        try {
          await auth.sendOTP(email)
        } catch (error) {
          console.error('Failed to send OTP:', error)
          throw error
        } finally {
          set({ isLoading: false })
        }
      },

      verifyOTP: async (email: string, code: string) => {
        set({ isLoading: true })
        try {
          const response = await auth.verifyOTP(email, code)
          
          // Check if user exists in our database, create if not
          let dbUser = await databaseService.getUserById(response.user.uid)
          if (!dbUser) {
            // Create new user with default settings
            dbUser = await databaseService.createUser({
              email: response.user.email,
              first_name: response.user.name || response.user.email.split('@')[0],
              last_name: '',
              role: 'viewer', // Default role
              department: 'administration', // Default department
              status: 'active',
              phone: '',
              avatar_url: '',
              permissions: JSON.stringify([]), // No custom permissions initially
              last_login: new Date().toISOString()
            })
          } else {
            // Update last login time
            await databaseService.updateUser(response.user.uid, {
              ...dbUser,
              last_login: new Date().toISOString()
            })
          }
          
          set({
            user: response.user,
            userId: response.user.uid,
            isAuthenticated: true,
            isLoading: false
          })
        } catch (error) {
          console.error('Failed to verify OTP:', error)
          set({ isLoading: false })
          throw error
        }
      },

      logout: async () => {
        try {
          await auth.logout()
        } catch (error) {
          console.error('Logout error:', error)
        } finally {
          set({
            user: null,
            userId: undefined,
            isAuthenticated: false
          })
          // Clear localStorage
          localStorage.removeItem('DEVV_CODE_SID')
        }
      },

      checkAuth: async () => {
        const sid = localStorage.getItem('DEVV_CODE_SID')
        const { user } = get()
        
        if (sid && user) {
          try {
            // Ensure user exists in database
            let dbUser = await databaseService.getUserById(user.uid)
            if (!dbUser) {
              // Create user if missing from database
              dbUser = await databaseService.createUser({
                email: user.email,
                first_name: user.name || user.email.split('@')[0],
                last_name: '',
                role: 'viewer',
                department: 'administration',
                status: 'active',
                phone: '',
                avatar_url: '',
                permissions: JSON.stringify([]),
                last_login: new Date().toISOString()
              })
            }
            set({ isAuthenticated: true, userId: user.uid })
          } catch (error) {
            console.error('Error checking auth/creating user:', error)
            set({ isAuthenticated: true, userId: user.uid }) // Still allow auth even if DB fails
          }
        } else {
          set({ isAuthenticated: false, user: null, userId: undefined })
        }
      },

      getCurrentUserId: () => {
        const { user } = get()
        return user?.uid || null
      }
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({
        user: state.user,
        userId: state.userId,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)
