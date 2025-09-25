# OphthalmoTech Permission System Documentation

## Overview

OphthalmoTech implements a comprehensive role-based access control (RBAC) system with granular permissions, role hierarchy, department-based modifiers, and custom user-specific permissions.

## Architecture

### 1. Permission Structure
```
permission = "resource:action"
```

**Resources (10 categories):**
- `users` - User Management
- `devices` - Medical Devices
- `maintenance` - Maintenance Records
- `reports` - Reports & Documentation
- `analytics` - Analytics & Insights
- `system` - System Configuration
- `audit` - Audit Logs
- `files` - File Management
- `email` - Email Communications
- `ai_chat` - AI Assistant

**Actions (9 types):**
- `create` - Create new records
- `read` - View/Read access
- `update` - Edit/Modify
- `delete` - Remove records
- `export` - Export data
- `import` - Import data
- `approve` - Approve requests
- `assign` - Assign tasks
- `configure` - Configure settings

**Total: 90 possible permissions (10 resources × 9 actions)**

### 2. Role Hierarchy

#### Viewer (Level 1) - 6 permissions
- `devices:read`
- `maintenance:read`
- `reports:read`
- `analytics:read`
- `files:read`
- `ai_chat:read`

#### Technician (Level 2) - 14 permissions
- **Inherits:** All Viewer permissions
- **Additional:**
  - `devices:update`
  - `maintenance:create`
  - `maintenance:update`
  - `files:create`
  - `files:update`
  - `ai_chat:create`
  - `reports:export`

#### Manager (Level 3) - 28 permissions
- **Inherits:** All Technician permissions
- **Additional:**
  - `devices:create`
  - `devices:delete`
  - `maintenance:delete`
  - `maintenance:approve`
  - `maintenance:assign`
  - `users:read`
  - `users:create`
  - `users:update`
  - `reports:create`
  - `reports:update`
  - `analytics:export`
  - `files:delete`
  - `email:create`
  - `audit:read`

#### Admin (Level 4) - 35 permissions
- **Full system access** - All 35 implemented permissions
- **System configuration** access
- **User management** with all CRUD operations
- **Audit log** access
- **Email configuration**
- **AI system configuration**

### 3. Department-Based Modifiers

#### Ophthalmology Department
- Additional focus on device operation and maintenance
- Enhanced AI chat access for clinical support

#### Biomedical Engineering Department  
- Extended device configuration and maintenance approval
- Advanced reporting capabilities

#### IT Department
- System configuration access
- User account management
- Audit log access
- Service configuration rights

#### Administration Department
- User overview and reporting
- Analytics and export capabilities
- Audit access for compliance

### 4. Custom User Permissions

Users can be granted or revoked specific permissions beyond their role and department:
- **Additive:** Grant additional permissions not covered by role/department
- **Logged:** All permission changes are audit logged
- **Granular:** Individual permission control
- **Real-time:** Immediate effect on user access

## Implementation Components

### 1. Permission Service (`permission-service.ts`)
- **Core Logic:** Permission resolution and validation
- **Methods:**
  - `getUserPermissions(user)` - Get all effective permissions
  - `hasPermission(user, permission)` - Check specific permission
  - `hasAnyPermission(user, permissions)` - OR logic check
  - `hasAllPermissions(user, permissions)` - AND logic check
  - `grantPermission(userId, permission)` - Add custom permission
  - `revokePermission(userId, permission)` - Remove custom permission

### 2. Permission Guard (`PermissionGuard.tsx`)
- **Component:** Wraps content with permission checks
- **Features:**
  - Loading states during permission validation
  - Custom fallback UI for denied access
  - Multiple permission logic (AND/OR)
  - Role-level checks
  - Real-time permission validation

**Usage Examples:**
```tsx
// Basic permission check
<PermissionGuard permission="users:create">
  <CreateUserForm />
</PermissionGuard>

// Multiple permissions (any)
<PermissionGuard permissions={['users:read', 'users:update']} requireAll={false}>
  <UserEditForm />
</PermissionGuard>

// Role-based access
<PermissionGuard minRoleLevel="manager">
  <ManagerDashboard />
</PermissionGuard>

// Custom fallback
<PermissionGuard 
  permission="admin:only"
  fallback={<div>Admin access required</div>}
>
  <AdminPanel />
</PermissionGuard>
```

### 3. Permission Components

#### PermissionVisible
- **Purpose:** Simple show/hide based on permissions
- **Use Case:** Menu items, buttons, sections

```tsx
<PermissionVisible permission="users:delete">
  <DeleteButton />
</PermissionVisible>
```

#### PermissionButton
- **Purpose:** Smart button with permission-aware state
- **Features:** Auto-disable, tooltip on denied access

```tsx
<PermissionButton 
  permission="devices:create"
  fallbackText="Need device creation permission"
  onClick={handleCreate}
>
  Create Device
</PermissionButton>
```

### 4. Permission Hook (`usePermissionCheck`)
- **Purpose:** Programmatic permission checking in components
- **Methods:**
  - `checkPermission(permission)` - Async permission check
  - `checkPermissions(permissions, requireAll)` - Multiple permission check
  - `checkRole(role)` - Role validation
  - `checkMinRoleLevel(minRole)` - Role hierarchy check

```tsx
const { checkPermission } = usePermissionCheck()

const handleAction = async () => {
  const canEdit = await checkPermission('users:update')
  if (canEdit) {
    // Perform action
  }
}
```

### 5. Role Management Interface (`RoleManagement.tsx`)
- **Features:**
  - Visual permission matrix
  - Real-time role/permission editing
  - User permission summaries
  - Custom permission grants/revokes
  - Department permission visualization

### 6. Permission Demo (`PermissionDemo.tsx`)
- **Purpose:** Interactive testing and demonstration
- **Features:**
  - Live permission tests
  - Code examples
  - Component gallery
  - Real-time validation

## Database Schema

### Users Table (`users`)
```typescript
interface UserProfile {
  _id?: string
  _uid?: string
  email: string
  first_name: string
  last_name: string
  role: 'admin' | 'manager' | 'technician' | 'viewer'
  department: 'ophthalmology' | 'biomedical' | 'it' | 'administration'
  status: 'active' | 'inactive' | 'suspended'
  permissions?: string // JSON array of custom permissions
  // ... other fields
}
```

### User Activities Table (`user_activities`)
```typescript
interface UserActivity {
  _id?: string
  _uid?: string
  user_id: string
  action_type: 'login' | 'logout' | 'create' | 'update' | 'delete' | 'view' | 'export'
  resource_type: string
  resource_id?: string
  description: string
  timestamp: string
  // ... other fields
}
```

## Security Features

### 1. Real-time Validation
- All permission checks are performed server-side
- No client-side permission bypass possible
- Database-backed permission resolution

### 2. Audit Trail
- All permission changes logged
- User activity tracking
- Administrative action logging
- Compliance reporting ready

### 3. Session Management
- Permission checks tied to authenticated sessions
- Automatic session validation
- Inactive user handling

### 4. Role Hierarchy Enforcement
- Strict role level validation
- Inheritance-based permission resolution
- Department modifier application

## Best Practices

### 1. Component Design
- Use `PermissionGuard` for entire sections
- Use `PermissionVisible` for simple show/hide
- Use `PermissionButton` for action buttons
- Provide meaningful fallback messages

### 2. Permission Naming
- Follow `resource:action` convention
- Use descriptive resource names
- Standard action verbs for consistency

### 3. Role Assignment
- Start with appropriate base role
- Use department modifiers for specific needs
- Add custom permissions sparingly
- Regular permission audits

### 4. Testing
- Use Permission Demo for testing
- Validate all permission scenarios
- Test role transitions
- Verify audit logging

## Integration Points

### 1. Authentication Flow
```typescript
// After successful login
const user = await databaseService.getUserById(userId)
const permissions = permissionService.getUserPermissions(user)
// Store in auth context/state
```

### 2. Route Protection
```tsx
<ProtectedRoute>
  <PermissionGuard minRoleLevel="manager">
    <AdminRoutes />
  </PermissionGuard>
</ProtectedRoute>
```

### 3. API Endpoint Protection
```typescript
// Using permission decorator
@requirePermission('users:create')
async createUser(userData: UserData) {
  // Implementation
}
```

### 4. Menu Rendering
```tsx
const menuItems = [
  {
    path: '/users',
    component: UserManagement,
    permission: 'users:read'
  },
  {
    path: '/admin',
    component: AdminPanel,
    minRole: 'admin'
  }
]
```

## Future Enhancements

### 1. Time-based Permissions
- Temporary permission grants
- Scheduled permission changes
- Time-limited access

### 2. Resource-specific Permissions
- Object-level permissions
- Owner-based access control
- Context-aware permissions

### 3. Permission Templates
- Role templates for quick setup
- Department-specific templates
- Custom permission sets

### 4. Advanced Audit
- Permission usage analytics
- Access pattern analysis
- Security compliance reporting

## Troubleshooting

### Common Issues

1. **Permission Not Working**
   - Check user status (active/inactive)
   - Verify role assignment
   - Check custom permissions
   - Validate permission string format

2. **Access Denied Unexpectedly**
   - Check role hierarchy
   - Verify department permissions
   - Review custom permission revocations
   - Check session authentication

3. **Performance Issues**
   - Permission caching strategies
   - Batch permission checks
   - Optimize database queries
   - Review permission complexity

### Debug Tools

1. **Permission Demo Page**
   - Real-time permission testing
   - Current user permission display
   - Permission resolution tracing

2. **User Management Interface**
   - Visual permission matrix
   - Role assignment verification
   - Custom permission tracking

3. **Audit Logs**
   - Permission change history
   - User activity tracking
   - Access pattern analysis

This comprehensive permission system provides enterprise-grade access control suitable for healthcare environments with strict security and compliance requirements.
