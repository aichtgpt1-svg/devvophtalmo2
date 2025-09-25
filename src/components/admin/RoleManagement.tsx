import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Shield, 
  Users, 
  Settings, 
  Eye, 
  EyeOff, 
  Plus, 
  Minus, 
  Search,
  UserCheck,
  UserX,
  Crown,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { databaseService, UserProfile } from '@/services/database-service'
import { 
  permissionService, 
  ROLE_PERMISSIONS, 
  RESOURCES, 
  ACTIONS, 
  Permission,
  DEPARTMENT_PERMISSIONS
} from '@/services/permission-service'

interface RoleManagementProps {
  onUserUpdate?: () => void
}

export function RoleManagement({ onUserUpdate }: RoleManagementProps) {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState<string>('all')
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all')
  const [showPermissionMatrix, setShowPermissionMatrix] = useState(false)
  const [customPermissions, setCustomPermissions] = useState<Permission[]>([])
  const { toast } = useToast()

  const roleColors = {
    admin: 'bg-red-100 text-red-800 border-red-200',
    manager: 'bg-blue-100 text-blue-800 border-blue-200',
    technician: 'bg-green-100 text-green-800 border-green-200',
    viewer: 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const roleIcons = {
    admin: Crown,
    manager: Shield,
    technician: Settings,
    viewer: Eye
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const { users: fetchedUsers } = await databaseService.getAllUsers(100)
      setUsers(fetchedUsers)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = searchTerm === '' || 
      user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRole = selectedRole === 'all' || user.role === selectedRole
    const matchesDepartment = selectedDepartment === 'all' || user.department === selectedDepartment
    
    return matchesSearch && matchesRole && matchesDepartment
  })

  const handleRoleChange = async (userId: string, userItemId: string, newRole: string) => {
    try {
      await databaseService.updateUser(userId, {
        _id: userItemId,
        role: newRole as UserProfile['role']
      })
      
      toast({
        title: "Success",
        description: `User role updated to ${newRole}`,
      })
      
      await loadUsers()
      onUserUpdate?.()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive"
      })
    }
  }

  const handleStatusChange = async (userId: string, userItemId: string, newStatus: string) => {
    try {
      await databaseService.updateUser(userId, {
        _id: userItemId,
        status: newStatus as UserProfile['status']
      })
      
      toast({
        title: "Success",
        description: `User status updated to ${newStatus}`,
      })
      
      await loadUsers()
      onUserUpdate?.()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive"
      })
    }
  }

  const handlePermissionToggle = async (userId: string, permission: Permission, granted: boolean) => {
    try {
      if (granted) {
        await permissionService.grantPermission(userId, permission)
        toast({
          title: "Permission Granted",
          description: `${permission} permission granted to user`,
        })
      } else {
        await permissionService.revokePermission(userId, permission)
        toast({
          title: "Permission Revoked",
          description: `${permission} permission revoked from user`,
        })
      }
      
      await loadUsers()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user permissions",
        variant: "destructive"
      })
    }
  }

  const PermissionMatrix = () => {
    const availablePermissions = permissionService.getAvailablePermissions()
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Role-based Permissions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Role Permissions Matrix
              </CardTitle>
              <CardDescription>
                Default permissions assigned to each role
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(ROLE_PERMISSIONS).map(([role, permissions]) => {
                  const RoleIcon = roleIcons[role as keyof typeof roleIcons] || Shield
                  return (
                    <div key={role} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <RoleIcon className="h-4 w-4" />
                        <span className="font-medium capitalize">{role}</span>
                        <Badge variant="outline" className={roleColors[role as keyof typeof roleColors]}>
                          {permissions.length} permissions
                        </Badge>
                      </div>
                      <div className="pl-6 grid grid-cols-1 gap-1">
                        {permissions.map(permission => (
                          <div key={permission} className="text-sm text-muted-foreground">
                            {permissionService.getPermissionDescription(permission)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Department-based Permissions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Department Permissions
              </CardTitle>
              <CardDescription>
                Additional permissions granted by department
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(DEPARTMENT_PERMISSIONS).map(([department, permissions]) => (
                  <div key={department} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium capitalize">{department}</span>
                      <Badge variant="outline">
                        {permissions.length} additional permissions
                      </Badge>
                    </div>
                    <div className="pl-4 grid grid-cols-1 gap-1">
                      {permissions.map(permission => (
                        <div key={permission} className="text-sm text-muted-foreground">
                          {permissionService.getPermissionDescription(permission)}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Complete Permission Grid */}
        <Card>
          <CardHeader>
            <CardTitle>Complete Permission Overview</CardTitle>
            <CardDescription>
              All available permissions organized by resource type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(availablePermissions).map(([resource, permissions]) => (
                <Card key={resource} className="border-muted">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium capitalize">
                      {resource.replace('_', ' ')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-1">
                      {permissions.map(permission => (
                        <div key={permission} className="text-xs text-muted-foreground">
                          {permission.split(':')[1]}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const UserPermissionsEditor = ({ user }: { user: UserProfile }) => {
    const [userPermissions, setUserPermissions] = useState<Permission[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
      if (user) {
        const permissions = permissionService.getUserPermissions(user)
        setUserPermissions(permissions)
        
        // Load custom permissions
        if (user.permissions) {
          try {
            setCustomPermissions(JSON.parse(user.permissions))
          } catch (error) {
            setCustomPermissions([])
          }
        }
        setLoading(false)
      }
    }, [user])

    const rolePermissions = ROLE_PERMISSIONS[user.role] || []
    const departmentPermissions = DEPARTMENT_PERMISSIONS[user.department] || []
    const availablePermissions = permissionService.getAvailablePermissions()

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">
              {user.first_name} {user.last_name}
            </h3>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={roleColors[user.role]}>
              {user.role}
            </Badge>
            <Badge variant="outline">
              {user.department}
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="role">Role</TabsTrigger>
            <TabsTrigger value="department">Department</TabsTrigger>
            <TabsTrigger value="custom">Custom</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Permission Summary</CardTitle>
                <CardDescription>
                  All effective permissions for this user
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(availablePermissions).map(([resource, permissions]) => {
                    const userHasPermissions = permissions.filter(p => userPermissions.includes(p))
                    
                    if (userHasPermissions.length === 0) return null
                    
                    return (
                      <div key={resource} className="space-y-2">
                        <div className="font-medium text-sm capitalize">
                          {resource.replace('_', ' ')}
                        </div>
                        <div className="space-y-1">
                          {userHasPermissions.map(permission => (
                            <div key={permission} className="flex items-center gap-2 text-sm">
                              <CheckCircle className="h-3 w-3 text-green-500" />
                              <span>{permission.split(':')[1]}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="role" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Role-Based Permissions</CardTitle>
                <CardDescription>
                  Permissions inherited from the {user.role} role
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {rolePermissions.map(permission => (
                    <div key={permission} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-3 w-3 text-blue-500" />
                      <span>{permissionService.getPermissionDescription(permission)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="department" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Department Permissions</CardTitle>
                <CardDescription>
                  Additional permissions from the {user.department} department
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {departmentPermissions.length > 0 ? (
                    departmentPermissions.map(permission => (
                      <div key={permission} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span>{permissionService.getPermissionDescription(permission)}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No additional department permissions
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="custom" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Custom Permissions</CardTitle>
                <CardDescription>
                  Individual permissions granted or revoked for this user
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(availablePermissions).map(([resource, permissions]) => (
                    <div key={resource} className="space-y-2">
                      <div className="font-medium text-sm capitalize border-b pb-1">
                        {resource.replace('_', ' ')}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {permissions.map(permission => {
                          const hasFromRole = rolePermissions.includes(permission)
                          const hasFromDepartment = departmentPermissions.includes(permission)
                          const hasCustom = customPermissions.includes(permission)
                          const isGranted = hasFromRole || hasFromDepartment || hasCustom
                          
                          return (
                            <div key={permission} className="flex items-center justify-between">
                              <span className="text-sm">{permission.split(':')[1]}</span>
                              <div className="flex items-center gap-2">
                                {hasFromRole && (
                                  <Badge variant="outline" className="text-xs">Role</Badge>
                                )}
                                {hasFromDepartment && (
                                  <Badge variant="outline" className="text-xs">Dept</Badge>
                                )}
                                <Switch
                                  checked={hasCustom}
                                  onCheckedChange={(checked) => 
                                    handlePermissionToggle(user._uid || '', permission, checked)
                                  }
                                  disabled={hasFromRole || hasFromDepartment}
                                />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Role & Permission Management</h2>
          <p className="text-muted-foreground">
            Manage user roles, permissions, and access control
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowPermissionMatrix(!showPermissionMatrix)}
        >
          {showPermissionMatrix ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
          {showPermissionMatrix ? 'Hide' : 'Show'} Permission Matrix
        </Button>
      </div>

      {showPermissionMatrix && <PermissionMatrix />}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Management
          </CardTitle>
          <CardDescription>
            View and manage user roles and permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="technician">Technician</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="ophthalmology">Ophthalmology</SelectItem>
                <SelectItem value="biomedical">Biomedical</SelectItem>
                <SelectItem value="it">IT</SelectItem>
                <SelectItem value="administration">Administration</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Users Table */}
          <div className="border rounded-lg">
            <div className="p-4 border-b bg-muted/50">
              <div className="grid grid-cols-12 gap-4 font-medium text-sm">
                <div className="col-span-3">User</div>
                <div className="col-span-2">Role</div>
                <div className="col-span-2">Department</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2">Permissions</div>
                <div className="col-span-1">Actions</div>
              </div>
            </div>
            <ScrollArea className="h-96">
              {filteredUsers.map((user) => {
                const RoleIcon = roleIcons[user.role] || Shield
                const userPermissions = permissionService.getUserPermissions(user)
                
                return (
                  <div key={user._id} className="p-4 border-b last:border-b-0 hover:bg-muted/25">
                    <div className="grid grid-cols-12 gap-4 items-center">
                      {/* User Info */}
                      <div className="col-span-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium">
                              {user.first_name?.[0]}{user.last_name?.[0]}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-sm">
                              {user.first_name} {user.last_name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Role */}
                      <div className="col-span-2">
                        <Select
                          value={user.role}
                          onValueChange={(value) => handleRoleChange(user._uid || '', user._id || '', value)}
                        >
                          <SelectTrigger className="h-8">
                            <div className="flex items-center gap-2">
                              <RoleIcon className="h-3 w-3" />
                              <SelectValue />
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="viewer">Viewer</SelectItem>
                            <SelectItem value="technician">Technician</SelectItem>
                            <SelectItem value="manager">Manager</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Department */}
                      <div className="col-span-2">
                        <Badge variant="outline" className="capitalize">
                          {user.department}
                        </Badge>
                      </div>

                      {/* Status */}
                      <div className="col-span-2">
                        <Select
                          value={user.status}
                          onValueChange={(value) => handleStatusChange(user._uid || '', user._id || '', value)}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-3 w-3 text-green-500" />
                                Active
                              </div>
                            </SelectItem>
                            <SelectItem value="inactive">
                              <div className="flex items-center gap-2">
                                <XCircle className="h-3 w-3 text-gray-500" />
                                Inactive
                              </div>
                            </SelectItem>
                            <SelectItem value="suspended">
                              <div className="flex items-center gap-2">
                                <AlertTriangle className="h-3 w-3 text-red-500" />
                                Suspended
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Permissions Count */}
                      <div className="col-span-2">
                        <Badge variant="outline">
                          {userPermissions.length} permissions
                        </Badge>
                      </div>

                      {/* Actions */}
                      <div className="col-span-1">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Settings className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl">
                            <DialogHeader>
                              <DialogTitle>Manage User Permissions</DialogTitle>
                              <DialogDescription>
                                View and modify permissions for this user
                              </DialogDescription>
                            </DialogHeader>
                            <UserPermissionsEditor user={user} />
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </div>
                )
              })}
            </ScrollArea>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No users found matching the current filters
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
