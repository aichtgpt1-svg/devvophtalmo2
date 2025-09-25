import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { 
  LayoutDashboard, 
  Stethoscope, 
  Calendar, 
  AlertTriangle, 
  FileText, 
  Upload, 
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Shield,
  Users,
  UserCog
} from 'lucide-react'

interface SidebarProps {
  activeView: string
  onViewChange: (view: string) => void
}

export default function Sidebar({ activeView, onViewChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'devices', label: 'Devices', icon: Stethoscope },
    { id: 'maintenance', label: 'Maintenance', icon: Calendar },
    { id: 'alerts', label: 'Alerts', icon: AlertTriangle },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'compliance', label: 'Compliance', icon: Shield },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'roles', label: 'Role Management', icon: UserCog },
    { id: 'permissions', label: 'Permission Demo', icon: Shield },
    { id: 'file-upload', label: 'File Analysis', icon: Upload },
    { id: 'ai-chat', label: 'AI Assistant', icon: MessageSquare }
  ]

  return (
    <div className={cn(
      "bg-white border-r border-gray-200 transition-all duration-300 flex flex-col",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className="p-4 border-b border-gray-200">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="w-full justify-end"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = activeView === item.id
          
          return (
            <Button
              key={item.id}
              variant={isActive ? "default" : "ghost"}
              className={cn(
                "w-full justify-start gap-3",
                collapsed && "justify-center",
                isActive && "bg-blue-600 text-white hover:bg-blue-700"
              )}
              onClick={() => onViewChange(item.id)}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Button>
          )
        })}
      </nav>

      {!collapsed && (
        <div className="p-4 border-t border-gray-200">
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm font-medium text-blue-900">Pro Tip</p>
            <p className="text-xs text-blue-700 mt-1">
              Use AI Assistant for device troubleshooting and maintenance guidance.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
