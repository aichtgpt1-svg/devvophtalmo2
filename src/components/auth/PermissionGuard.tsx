import React, { useState, useEffect } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, AlertTriangle, Lock, Eye, EyeOff } from 'lucide-react'
import { Permission, permissionService } from '@/services/permission-service'
import { databaseService, UserProfile } from '@/services/database-service'
import { useAuthStore } from '@/store/auth-store'

interface PermissionGuardProps {
  permission?: Permission
  permissions?: Permission[]
  requireAll?: boolean // For multiple permissions: true = require all, false = require any
  role?: string
  minRoleLevel?: string
  fallback?: React.ReactNode
  showFallback?: boolean
  children: React.ReactNode
  className?: string
}

export function PermissionGuard({
  permission,
  permissions = [],
  requireAll = false,
  role,
  minRoleLevel,
  fallback,
  showFallback = true,
  children,
  className
}: PermissionGuardProps) {
  const [hasAccess, setHasAccess] = useState(false)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<UserProfile | null>(null)
  const [accessReason, setAccessReason] = useState<string>('')
  const { userId, isAuthenticated } = useAuthStore()

  useEffect(() => {
    checkAccess()
  }, [permission, permissions, role, minRoleLevel, userId, isAuthenticated])

  const checkAccess = async () => {
    if (!isAuthenticated || !userId) {
      setHasAccess(false)
      setAccessReason('User not authenticated')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      
      // Get current user
      const currentUser = await databaseService.getUserById(userId)
      if (!currentUser) {
        setHasAccess(false)
        setAccessReason('User profile not found')
        setLoading(false)
        return
      }

      setUser(currentUser)

      // Check if user is active
      if (currentUser.status !== 'active') {
        setHasAccess(false)
        setAccessReason(`Account is ${currentUser.status}`)
        setLoading(false)
        return
      }

      let hasPermission = true
      let reason = ''

      // Check role-based access
      if (role && currentUser.role !== role) {
        hasPermission = false
        reason = `Requires ${role} role (current: ${currentUser.role})`
      }

      // Check minimum role level
      if (minRoleLevel && !permissionService.hasRoleLevel(currentUser.role, minRoleLevel)) {
        hasPermission = false
        reason = `Requires minimum ${minRoleLevel} role level (current: ${currentUser.role})`
      }

      // Check specific permission
      if (permission && hasPermission) {
        const hasSpecificPermission = permissionService.hasPermission(currentUser, permission)
        if (!hasSpecificPermission) {
          hasPermission = false
          reason = `Missing required permission: ${permissionService.getPermissionDescription(permission)}`
        }
      }

      // Check multiple permissions
      if (permissions.length > 0 && hasPermission) {
        if (requireAll) {
          const hasAllPermissions = permissionService.hasAllPermissions(currentUser, permissions)
          if (!hasAllPermissions) {
            hasPermission = false
            const userPermissions = permissionService.getUserPermissions(currentUser)
            const missingPermissions = permissions.filter(p => !userPermissions.includes(p))
            reason = `Missing required permissions: ${missingPermissions.map(p => permissionService.getPermissionDescription(p)).join(', ')}`
          }
        } else {
          const hasAnyPermission = permissionService.hasAnyPermission(currentUser, permissions)
          if (!hasAnyPermission) {
            hasPermission = false
            reason = `Missing any of required permissions: ${permissions.map(p => permissionService.getPermissionDescription(p)).join(', ')}`
          }
        }
      }

      setHasAccess(hasPermission)
      setAccessReason(reason)
    } catch (error) {
      console.error('Error checking permissions:', error)
      setHasAccess(false)
      setAccessReason(`Permission check failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-4 ${className}`}>
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (hasAccess) {
    return <div className={className}>{children}</div>
  }

  // Show custom fallback if provided
  if (fallback) {
    return <div className={className}>{fallback}</div>
  }

  // Don't show anything if showFallback is false
  if (!showFallback) {
    return null
  }

  // Default access denied UI
  return (
    <div className={className}>
      <Card className="border-destructive/20">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-destructive" />
            <CardTitle className="text-destructive">Access Denied</CardTitle>
          </div>
          <CardDescription>
            You don't have permission to access this content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="font-medium">
              {accessReason}
            </AlertDescription>
          </Alert>
          
          {user && (
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <div className="text-sm">
                <div className="font-medium">Your current access level:</div>
                <div className="mt-1 space-y-1">
                  <div>Role: {user.role}</div>
                  <div>Department: {user.department}</div>
                  <div>Status: {user.status}</div>
                  <div>Permissions: {permissionService.getUserPermissions(user).length} total</div>
                </div>
              </div>
            </div>
          )}
          
          <div className="mt-4 text-sm text-muted-foreground">
            Contact your administrator if you believe you should have access to this content.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Hook for checking permissions in components
export function usePermissionCheck() {
  const { userId, isAuthenticated } = useAuthStore()
  
  const checkPermission = async (permission: Permission): Promise<boolean> => {
    if (!isAuthenticated || !userId) return false
    
    try {
      const user = await databaseService.getUserById(userId)
      if (!user || user.status !== 'active') return false
      
      return permissionService.hasPermission(user, permission)
    } catch (error) {
      console.error('Error checking permission:', error)
      return false
    }
  }
  
  const checkPermissions = async (permissions: Permission[], requireAll = false): Promise<boolean> => {
    if (!isAuthenticated || !userId) return false
    
    try {
      const user = await databaseService.getUserById(userId)
      if (!user || user.status !== 'active') return false
      
      if (requireAll) {
        return permissionService.hasAllPermissions(user, permissions)
      } else {
        return permissionService.hasAnyPermission(user, permissions)
      }
    } catch (error) {
      console.error('Error checking permissions:', error)
      return false
    }
  }
  
  const checkRole = async (role: string): Promise<boolean> => {
    if (!isAuthenticated || !userId) return false
    
    try {
      const user = await databaseService.getUserById(userId)
      if (!user || user.status !== 'active') return false
      
      return user.role === role
    } catch (error) {
      console.error('Error checking role:', error)
      return false
    }
  }
  
  const checkMinRoleLevel = async (minRole: string): Promise<boolean> => {
    if (!isAuthenticated || !userId) return false
    
    try {
      const user = await databaseService.getUserById(userId)
      if (!user || user.status !== 'active') return false
      
      return permissionService.hasRoleLevel(user.role, minRole)
    } catch (error) {
      console.error('Error checking role level:', error)
      return false
    }
  }
  
  return {
    checkPermission,
    checkPermissions,
    checkRole,
    checkMinRoleLevel
  }
}

// Simple permission-based visibility component
export function PermissionVisible({ 
  permission, 
  permissions = [], 
  requireAll = false,
  children 
}: {
  permission?: Permission
  permissions?: Permission[]
  requireAll?: boolean
  children: React.ReactNode
}) {
  return (
    <PermissionGuard 
      permission={permission}
      permissions={permissions}
      requireAll={requireAll}
      showFallback={false}
    >
      {children}
    </PermissionGuard>
  )
}

// Permission-based button wrapper
export function PermissionButton({
  permission,
  permissions = [],
  requireAll = false,
  fallbackText = "Insufficient permissions",
  disabled = false,
  children,
  ...buttonProps
}: {
  permission?: Permission
  permissions?: Permission[]
  requireAll?: boolean
  fallbackText?: string
  disabled?: boolean
  children: React.ReactNode
} & React.ComponentProps<typeof Button>) {
  const [hasAccess, setHasAccess] = useState(false)
  const [loading, setLoading] = useState(true)
  const { userId, isAuthenticated } = useAuthStore()

  useEffect(() => {
    checkAccess()
  }, [permission, permissions, userId, isAuthenticated])

  const checkAccess = async () => {
    if (!isAuthenticated || !userId) {
      setHasAccess(false)
      setLoading(false)
      return
    }

    try {
      const user = await databaseService.getUserById(userId)
      if (!user || user.status !== 'active') {
        setHasAccess(false)
        setLoading(false)
        return
      }

      let hasPermission = true

      if (permission) {
        hasPermission = permissionService.hasPermission(user, permission)
      }

      if (permissions.length > 0 && hasPermission) {
        if (requireAll) {
          hasPermission = permissionService.hasAllPermissions(user, permissions)
        } else {
          hasPermission = permissionService.hasAnyPermission(user, permissions)
        }
      }

      setHasAccess(hasPermission)
    } catch (error) {
      setHasAccess(false)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Button disabled {...buttonProps}>
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
        Loading...
      </Button>
    )
  }

  return (
    <Button 
      disabled={disabled || !hasAccess} 
      title={!hasAccess ? fallbackText : undefined}
      {...buttonProps}
    >
      {!hasAccess && <Lock className="h-4 w-4 mr-2" />}
      {children}
    </Button>
  )
}
