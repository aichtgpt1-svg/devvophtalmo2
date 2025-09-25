import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { 
  Shield, 
  Eye, 
  Lock, 
  Unlock, 
  Code, 
  CheckCircle, 
  XCircle,
  Users,
  Settings,
  FileText,
  Activity
} from 'lucide-react'
import { 
  PermissionGuard, 
  PermissionVisible, 
  PermissionButton, 
  usePermissionCheck 
} from '@/components/auth/PermissionGuard'
import { Permission } from '@/services/permission-service'

export function PermissionDemo() {
  const [demoResults, setDemoResults] = useState<Record<string, boolean>>({})
  const { checkPermission, checkPermissions, checkRole, checkMinRoleLevel } = usePermissionCheck()

  useEffect(() => {
    runPermissionTests()
  }, [])

  const runPermissionTests = async () => {
    const results: Record<string, boolean> = {}
    
    // Test individual permissions
    results['users:read'] = await checkPermission('users:read')
    results['users:create'] = await checkPermission('users:create')
    results['users:delete'] = await checkPermission('users:delete')
    results['devices:create'] = await checkPermission('devices:create')
    results['system:configure'] = await checkPermission('system:configure')
    
    // Test multiple permissions
    results['any_user_permission'] = await checkPermissions(['users:read', 'users:create'], false)
    results['all_user_permissions'] = await checkPermissions(['users:read', 'users:create'], true)
    
    // Test roles
    results['is_admin'] = await checkRole('admin')
    results['is_manager'] = await checkRole('manager')
    results['min_technician'] = await checkMinRoleLevel('technician')
    results['min_manager'] = await checkMinRoleLevel('manager')
    
    setDemoResults(results)
  }

  const codeExamples = {
    permissionGuard: `// Basic Permission Guard
<PermissionGuard permission="users:create">
  <CreateUserForm />
</PermissionGuard>

// Multiple permissions (any)
<PermissionGuard 
  permissions={['users:read', 'users:update']} 
  requireAll={false}
>
  <UserEditForm />
</PermissionGuard>

// Role-based access
<PermissionGuard minRoleLevel="manager">
  <ManagerDashboard />
</PermissionGuard>`,

    permissionVisible: `// Simple visibility control
<PermissionVisible permission="users:delete">
  <DeleteButton />
</PermissionVisible>

// Multiple permissions
<PermissionVisible 
  permissions={['reports:create', 'reports:update']}
  requireAll={true}
>
  <ReportEditor />
</PermissionVisible>`,

    permissionButton: `// Permission-aware button
<PermissionButton 
  permission="devices:create"
  fallbackText="You need device creation permissions"
  onClick={handleCreateDevice}
>
  Create Device
</PermissionButton>

// Multiple permissions required
<PermissionButton 
  permissions={['maintenance:approve', 'maintenance:assign']}
  requireAll={true}
  onClick={handleApproveAll}
>
  Approve All Maintenance
</PermissionButton>`,

    hookUsage: `// Using the permission hook
const { checkPermission, checkPermissions } = usePermissionCheck()

const handleAction = async () => {
  const canEdit = await checkPermission('users:update')
  if (canEdit) {
    // Perform action
  }
  
  const canManage = await checkPermissions(
    ['users:create', 'users:delete'], 
    true // require all
  )
  if (canManage) {
    // Show management interface
  }
}`
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Permission System Demo</h2>
        <p className="text-muted-foreground">
          Interactive examples of the role-based permission system
        </p>
      </div>

      <Tabs defaultValue="examples" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="examples">Live Examples</TabsTrigger>
          <TabsTrigger value="tests">Permission Tests</TabsTrigger>
          <TabsTrigger value="code">Code Examples</TabsTrigger>
          <TabsTrigger value="components">Component Gallery</TabsTrigger>
        </TabsList>

        <TabsContent value="examples" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Permission Guard Examples */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Permission Guard Examples
                </CardTitle>
                <CardDescription>
                  Components protected by permission requirements
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                
                {/* Admin Only */}
                <div>
                  <h4 className="font-medium mb-2">Admin Only Section</h4>
                  <PermissionGuard role="admin">
                    <Alert>
                      <Shield className="h-4 w-4" />
                      <AlertDescription>
                        🎉 You have admin access! This content is only visible to administrators.
                      </AlertDescription>
                    </Alert>
                  </PermissionGuard>
                </div>

                {/* User Management Permission */}
                <div>
                  <h4 className="font-medium mb-2">User Creation Permission</h4>
                  <PermissionGuard permission="users:create">
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-green-800">You can create users!</span>
                      </div>
                    </div>
                  </PermissionGuard>
                </div>

                {/* System Configuration */}
                <div>
                  <h4 className="font-medium mb-2">System Configuration</h4>
                  <PermissionGuard permission="system:configure">
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Settings className="h-4 w-4 text-blue-600" />
                        <span className="text-blue-800">System settings available</span>
                      </div>
                    </div>
                  </PermissionGuard>
                </div>

                {/* Minimum Role Level */}
                <div>
                  <h4 className="font-medium mb-2">Manager Level Access</h4>
                  <PermissionGuard minRoleLevel="manager">
                    <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-purple-600" />
                        <span className="text-purple-800">Manager dashboard available</span>
                      </div>
                    </div>
                  </PermissionGuard>
                </div>

              </CardContent>
            </Card>

            {/* Permission Buttons */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Permission Buttons
                </CardTitle>
                <CardDescription>
                  Buttons that adapt based on user permissions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                
                <div className="space-y-2">
                  <h4 className="font-medium">User Management Actions</h4>
                  <div className="flex flex-wrap gap-2">
                    <PermissionButton 
                      permission="users:create"
                      size="sm"
                      fallbackText="Need user creation permission"
                    >
                      Create User
                    </PermissionButton>
                    
                    <PermissionButton 
                      permission="users:delete"
                      variant="destructive"
                      size="sm"
                      fallbackText="Need user deletion permission"
                    >
                      Delete User
                    </PermissionButton>
                    
                    <PermissionButton 
                      permissions={['users:read', 'users:export']}
                      requireAll={true}
                      variant="outline"
                      size="sm"
                      fallbackText="Need both read and export permissions"
                    >
                      Export Users
                    </PermissionButton>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Device Management</h4>
                  <div className="flex flex-wrap gap-2">
                    <PermissionButton 
                      permission="devices:create"
                      size="sm"
                      fallbackText="Need device creation permission"
                    >
                      Add Device
                    </PermissionButton>
                    
                    <PermissionButton 
                      permission="devices:configure"
                      variant="outline"
                      size="sm"
                      fallbackText="Need device configuration permission"
                    >
                      Configure
                    </PermissionButton>
                    
                    <PermissionButton 
                      permission="maintenance:approve"
                      size="sm"
                      fallbackText="Need maintenance approval permission"
                    >
                      Approve Maintenance
                    </PermissionButton>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="font-medium">Visibility Controls</h4>
                  <div className="space-y-2">
                    <PermissionVisible permission="audit:read">
                      <div className="flex items-center gap-2 text-sm">
                        <Eye className="h-3 w-3 text-green-500" />
                        <span>Audit logs menu item (visible)</span>
                      </div>
                    </PermissionVisible>
                    
                    <PermissionVisible permission="system:configure">
                      <div className="flex items-center gap-2 text-sm">
                        <Eye className="h-3 w-3 text-green-500" />
                        <span>System settings menu (visible)</span>
                      </div>
                    </PermissionVisible>
                    
                    <PermissionVisible permission="system:configure">
                      <div className="flex items-center gap-2 text-sm">
                        <Eye className="h-3 w-3 text-gray-400" />
                        <span>This won't show (hidden)</span>
                      </div>
                    </PermissionVisible>
                  </div>
                </div>

              </CardContent>
            </Card>

          </div>
        </TabsContent>

        <TabsContent value="tests" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Current User Permission Tests
              </CardTitle>
              <CardDescription>
                Real-time testing of your current user permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(demoResults).map(([test, result]) => (
                  <div key={test} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      {result ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span className="text-sm font-mono">{test}</span>
                    </div>
                    <Badge variant={result ? "default" : "secondary"}>
                      {result ? "PASS" : "FAIL"}
                    </Badge>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <Button onClick={runPermissionTests} size="sm">
                  <Activity className="h-4 w-4 mr-2" />
                  Refresh Tests
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="code" className="space-y-6">
          {Object.entries(codeExamples).map(([title, code]) => (
            <Card key={title}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 capitalize">
                  <Code className="h-5 w-5" />
                  {title.replace(/([A-Z])/g, ' $1').trim()}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                  <code>{code}</code>
                </pre>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="components" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <Card>
              <CardHeader>
                <CardTitle>Access Denied Example</CardTitle>
                <CardDescription>
                  How the system handles insufficient permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PermissionGuard permission="system:configure" role="superadmin">
                  <p>This content should never show</p>
                </PermissionGuard>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Custom Fallback</CardTitle>
                <CardDescription>
                  Custom UI when permissions are insufficient
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PermissionGuard 
                  permission="system:configure"
                  fallback={
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4 text-amber-600" />
                        <span className="text-amber-800">
                          Custom fallback: Admin access required for this feature
                        </span>
                      </div>
                    </div>
                  }
                >
                  <p>Admin-only content</p>
                </PermissionGuard>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Loading State</CardTitle>
                <CardDescription>
                  Permission checking with loading indicator
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 p-2 border rounded">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    <span className="text-sm">Checking permissions...</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    This is what users see while permissions are being validated
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Multiple Permission Logic</CardTitle>
                <CardDescription>
                  Testing AND vs OR permission logic
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium mb-1">Require ANY permission (OR logic):</p>
                    <PermissionGuard 
                      permissions={['users:read', 'devices:read']} 
                      requireAll={false}
                      fallback={<Badge variant="destructive">Need either users:read OR devices:read</Badge>}
                    >
                      <Badge variant="default">✓ You have at least one required permission</Badge>
                    </PermissionGuard>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium mb-1">Require ALL permissions (AND logic):</p>
                    <PermissionGuard 
                      permissions={['users:read', 'users:create', 'users:update']} 
                      requireAll={true}
                      fallback={<Badge variant="destructive">Need ALL user management permissions</Badge>}
                    >
                      <Badge variant="default">✓ You have all required permissions</Badge>
                    </PermissionGuard>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
