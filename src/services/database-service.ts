import { table } from '@devvai/devv-code-backend'
import { useAuthStore } from '@/store/auth-store'

// Table IDs from database
const TABLES = {
  USERS: 'eymv2gl7ckxs',
  USER_ACTIVITIES: 'eymv2uk8wcn4'
}

export interface UserProfile {
  _id?: string
  _uid?: string
  email: string
  first_name: string
  last_name: string
  role: 'admin' | 'manager' | 'technician' | 'viewer'
  department: 'ophthalmology' | 'biomedical' | 'it' | 'administration'
  status: 'active' | 'inactive' | 'suspended'
  phone?: string
  avatar_url?: string
  last_login?: string
  created_at?: string
  updated_at?: string
  permissions?: string // JSON string of permissions array
  bio?: string
  hire_date?: string
  license_number?: string
}

export interface UserActivity {
  _id?: string
  _uid?: string
  user_id: string
  action_type: 'login' | 'logout' | 'create' | 'update' | 'delete' | 'view' | 'export'
  resource_type: string
  resource_id?: string
  description: string
  ip_address?: string
  user_agent?: string
  timestamp: string
  metadata?: string // JSON string
}

class DatabaseService {
  private getCurrentUserId(): string {
    const userId = useAuthStore.getState().userId
    if (!userId) {
      throw new Error('User not authenticated')
    }
    return userId
  }

  // User Management
  async createUser(userData: Omit<UserProfile, '_id' | '_uid' | 'created_at' | 'updated_at'>): Promise<UserProfile> {
    try {
      const currentUserId = this.getCurrentUserId()
      const now = new Date().toISOString()
      
      const newUser: UserProfile = {
        ...userData,
        _uid: currentUserId,
        created_at: now,
        updated_at: now,
        permissions: userData.permissions || JSON.stringify([])
      }

      await table.addItem(TABLES.USERS, newUser)
      
      // Log activity
      await this.logActivity({
        user_id: currentUserId,
        action_type: 'create',
        resource_type: 'user',
        description: `Created user: ${userData.first_name} ${userData.last_name}`,
        timestamp: now
      })

      return newUser
    } catch (error) {
      console.error('Error creating user:', error)
      throw new Error('Failed to create user')
    }
  }

  async getAllUsers(limit = 50): Promise<{ users: UserProfile[], nextCursor?: string }> {
    try {
      const response = await table.getItems(TABLES.USERS, {
        limit,
        sort: 'created_at',
        order: 'desc'
      })

      return {
        users: response.items as UserProfile[],
        nextCursor: response.nextCursor
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      throw new Error('Failed to fetch users')
    }
  }

  async getUserById(userId: string): Promise<UserProfile | null> {
    try {
      const response = await table.getItems(TABLES.USERS, {
        query: {
          _uid: userId
        },
        limit: 1
      })

      return response.items.length > 0 ? response.items[0] as UserProfile : null
    } catch (error) {
      console.error('Error fetching user:', error)
      throw new Error('Failed to fetch user')
    }
  }

  async getUsersByRole(role: string, limit = 20): Promise<UserProfile[]> {
    try {
      const response = await table.getItems(TABLES.USERS, {
        query: {
          role: role
        },
        limit
      })

      return response.items as UserProfile[]
    } catch (error) {
      console.error('Error fetching users by role:', error)
      throw new Error('Failed to fetch users by role')
    }
  }

  async getUsersByDepartment(department: string, limit = 20): Promise<UserProfile[]> {
    try {
      const response = await table.getItems(TABLES.USERS, {
        query: {
          department: department
        },
        limit
      })

      return response.items as UserProfile[]
    } catch (error) {
      console.error('Error fetching users by department:', error)
      throw new Error('Failed to fetch users by department')
    }
  }

  async updateUser(userId: string, updates: Partial<UserProfile>): Promise<void> {
    try {
      const currentUserId = this.getCurrentUserId()
      
      const updateData = {
        _uid: userId,
        _id: updates._id || userId,
        ...updates,
        updated_at: new Date().toISOString()
      }

      await table.updateItem(TABLES.USERS, updateData)
      
      // Log activity
      await this.logActivity({
        user_id: currentUserId,
        action_type: 'update',
        resource_type: 'user',
        resource_id: userId,
        description: `Updated user profile`,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      console.error('Error updating user:', error)
      throw new Error('Failed to update user')
    }
  }

  async deleteUser(userId: string, userItemId: string): Promise<void> {
    try {
      const currentUserId = this.getCurrentUserId()
      
      await table.deleteItem(TABLES.USERS, {
        _uid: userId,
        _id: userItemId
      })
      
      // Log activity
      await this.logActivity({
        user_id: currentUserId,
        action_type: 'delete',
        resource_type: 'user',
        resource_id: userId,
        description: `Deleted user`,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      console.error('Error deleting user:', error)
      throw new Error('Failed to delete user')
    }
  }

  // Activity Logging
  async logActivity(activity: Omit<UserActivity, '_id' | '_uid'>): Promise<void> {
    try {
      const currentUserId = this.getCurrentUserId()
      
      const activityRecord: UserActivity = {
        ...activity,
        _uid: currentUserId,
        ip_address: activity.ip_address || 'unknown',
        user_agent: activity.user_agent || navigator.userAgent
      }

      await table.addItem(TABLES.USER_ACTIVITIES, activityRecord)
    } catch (error) {
      console.error('Error logging activity:', error)
      // Don't throw error for activity logging to avoid breaking main operations
    }
  }

  async getUserActivities(userId: string, limit = 50): Promise<UserActivity[]> {
    try {
      const response = await table.getItems(TABLES.USER_ACTIVITIES, {
        query: {
          user_id: userId
        },
        limit,
        sort: 'timestamp',
        order: 'desc'
      })

      return response.items as UserActivity[]
    } catch (error) {
      console.error('Error fetching user activities:', error)
      throw new Error('Failed to fetch user activities')
    }
  }

  async getAllActivities(limit = 100): Promise<UserActivity[]> {
    try {
      const response = await table.getItems(TABLES.USER_ACTIVITIES, {
        limit,
        sort: 'timestamp',
        order: 'desc'
      })

      return response.items as UserActivity[]
    } catch (error) {
      console.error('Error fetching activities:', error)
      throw new Error('Failed to fetch activities')
    }
  }

  // Search and Filter
  async searchUsers(searchTerm: string): Promise<UserProfile[]> {
    try {
      // Get all users and filter client-side since NoSQL has limited search
      const { users } = await this.getAllUsers(100)
      
      const lowerSearchTerm = searchTerm.toLowerCase()
      return users.filter(user => 
        user.first_name?.toLowerCase().includes(lowerSearchTerm) ||
        user.last_name?.toLowerCase().includes(lowerSearchTerm) ||
        user.email?.toLowerCase().includes(lowerSearchTerm) ||
        user.department?.toLowerCase().includes(lowerSearchTerm) ||
        user.role?.toLowerCase().includes(lowerSearchTerm)
      )
    } catch (error) {
      console.error('Error searching users:', error)
      throw new Error('Failed to search users')
    }
  }

  // Statistics
  async getUserStats(): Promise<{
    total: number
    byRole: Record<string, number>
    byDepartment: Record<string, number>
    byStatus: Record<string, number>
  }> {
    try {
      const { users } = await this.getAllUsers(1000)
      
      const stats = {
        total: users.length,
        byRole: {} as Record<string, number>,
        byDepartment: {} as Record<string, number>,
        byStatus: {} as Record<string, number>
      }

      users.forEach(user => {
        // Count by role
        stats.byRole[user.role] = (stats.byRole[user.role] || 0) + 1
        
        // Count by department
        stats.byDepartment[user.department] = (stats.byDepartment[user.department] || 0) + 1
        
        // Count by status
        stats.byStatus[user.status] = (stats.byStatus[user.status] || 0) + 1
      })

      return stats
    } catch (error) {
      console.error('Error getting user stats:', error)
      throw new Error('Failed to get user statistics')
    }
  }
}

export const databaseService = new DatabaseService()
