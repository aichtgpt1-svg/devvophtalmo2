import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import { databaseService, UserProfile } from '@/services/database-service'
import { userInsightsService, UserInsight, UserAnalytics } from '@/services/user-insights-service'
import { aiService } from '@/services/ai-service'
import {
  Users,
  UserPlus,
  UserCheck,
  UserX,
  Shield,
  Activity,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Brain,
  Mail,
  BarChart3,
  Zap
} from 'lucide-react'

export default function UserManagementDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [recentUsers, setRecentUsers] = useState<UserProfile[]>([])
  const [insights, setInsights] = useState<UserInsight[]>([])
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [aiAnalyzing, setAiAnalyzing] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Load basic stats and recent users
      const [userStats, { users }] = await Promise.all([
        databaseService.getUserStats(),
        databaseService.getAllUsers(10)
      ])
      
      setStats(userStats)
      setRecentUsers(users.slice(0, 5))
      
      // Load insights and analytics in background
      loadAdvancedData()
      
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const loadAdvancedData = async () => {
    try {
      const [userInsights, userAnalytics] = await Promise.all([
        userInsightsService.generateUserInsights(),
        userInsightsService.generateUserAnalytics()
      ])
      
      setInsights(userInsights)
      setAnalytics(userAnalytics)
    } catch (error) {
      console.error('Error loading advanced data:', error)
    }
  }

  const runAIAnalysis = async () => {
    try {
      setAiAnalyzing(true)
      
      const { users } = await databaseService.getAllUsers(100)
      const activities = await databaseService.getAllActivities(200)
      
      const analysisPrompt = `
        Analyze this OphthalmoTech user management data and provide actionable insights:
        
        Users: ${users.length} total
        Roles: ${JSON.stringify(stats?.byRole)}
        Departments: ${JSON.stringify(stats?.byDepartment)}
        Recent Activities: ${activities.slice(0, 20).map(a => `${a.action_type} on ${a.resource_type}`).join(', ')}
        
        Focus on:
        1. Security patterns and risks
        2. User engagement and productivity
        3. Role distribution optimization
        4. Department collaboration patterns
        5. Specific actionable recommendations
        
        Provide insights in a conversational, actionable format.
      `
      
      const aiInsights = await aiService.generateResponse(analysisPrompt)
      
      // Display AI insights in a modal or card
      toast({
        title: "AI Analysis Complete",
        description: "Check the AI insights section for detailed analysis"
      })
      
      // You could store this in state to display in a dedicated section
      console.log('AI Insights:', aiInsights)
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to run AI analysis",
        variant: "destructive"
      })
    } finally {
      setAiAnalyzing(false)
    }
  }

  const sendInsightsReport = async () => {
    try {
      if (!insights.length || !analytics) {
        toast({
          title: "Error",
          description: "No insights data available to send",
          variant: "destructive"
        })
        return
      }
      
      await userInsightsService.sendInsightsReport(insights, analytics)
      toast({
        title: "Success",
        description: "Insights report sent to administrators"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send insights report",
        variant: "destructive"
      })
    }
  }

  const performMaintenance = async () => {
    try {
      const result = await userInsightsService.performUserMaintenance()
      toast({
        title: "Maintenance Complete",
        description: `Found ${result.inactiveUsers} inactive users out of ${result.totalUsers} total`
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to perform user maintenance",
        variant: "destructive"
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Management Dashboard</h2>
          <p className="text-gray-600">Monitor and manage your healthcare team</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={runAIAnalysis}
            disabled={aiAnalyzing}
            variant="outline"
            className="bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200"
          >
            <Brain className="w-4 h-4 mr-2" />
            {aiAnalyzing ? 'Analyzing...' : 'AI Analysis'}
          </Button>
          <Button onClick={sendInsightsReport} variant="outline">
            <Mail className="w-4 h-4 mr-2" />
            Send Report
          </Button>
          <Button onClick={performMaintenance} variant="outline">
            <Zap className="w-4 h-4 mr-2" />
            Maintenance
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Users</p>
                <p className="text-2xl font-bold text-blue-900">{stats?.total || 0}</p>
                <p className="text-xs text-blue-600">Active platform users</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Active Users</p>
                <p className="text-2xl font-bold text-green-900">{stats?.byStatus?.active || 0}</p>
                <p className="text-xs text-green-600">Currently active</p>
              </div>
              <UserCheck className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Administrators</p>
                <p className="text-2xl font-bold text-purple-900">{stats?.byRole?.admin || 0}</p>
                <p className="text-xs text-purple-600">Admin privileges</p>
              </div>
              <Shield className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Recent Logins</p>
                <p className="text-2xl font-bold text-orange-900">{analytics?.securityMetrics.recentLogins || 0}</p>
                <p className="text-xs text-orange-600">Past 7 days</p>
              </div>
              <Activity className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-blue-600" />
              Recent Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentUsers.map((user) => (
                <div key={user._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={user.avatar_url} />
                    <AvatarFallback className="bg-blue-100 text-blue-600 text-sm">
                      {user.first_name?.[0]}{user.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {user.first_name} {user.last_name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {user.role}
                      </Badge>
                      <Badge variant={user.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                        {user.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right text-xs text-gray-500">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Role Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Role Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(stats?.byRole || {}).map(([role, count]) => (
                <div key={role} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      role === 'admin' ? 'bg-red-500' :
                      role === 'manager' ? 'bg-blue-500' :
                      role === 'technician' ? 'bg-green-500' :
                      'bg-gray-500'
                    }`} />
                    <span className="capitalize font-medium text-gray-700">{role}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`h-2 rounded-full ${
                      role === 'admin' ? 'bg-red-200' :
                      role === 'manager' ? 'bg-blue-200' :
                      role === 'technician' ? 'bg-green-200' :
                      'bg-gray-200'
                    }`} style={{ width: `${Math.max(20, (count as number) * 10)}px` }} />
                    <Badge variant="outline">{count as number}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Insights */}
      {insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              Security & Performance Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {insights.slice(0, 3).map((insight, index) => (
                <Alert key={index} className={`border-l-4 ${
                  insight.severity === 'critical' ? 'border-l-red-500 bg-red-50' :
                  insight.severity === 'high' ? 'border-l-orange-500 bg-orange-50' :
                  insight.severity === 'medium' ? 'border-l-yellow-500 bg-yellow-50' :
                  'border-l-blue-500 bg-blue-50'
                }`}>
                  <div className="flex items-start gap-3">
                    {insight.severity === 'critical' || insight.severity === 'high' ? (
                      <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
                    ) : (
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                      <AlertDescription className="mt-1 text-gray-700">
                        {insight.description}
                      </AlertDescription>
                      {insight.recommendations.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm font-medium text-gray-900 mb-1">Recommendations:</p>
                          <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                            {insight.recommendations.slice(0, 2).map((rec, i) => (
                              <li key={i}>{rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    <Badge variant={
                      insight.severity === 'critical' ? 'destructive' :
                      insight.severity === 'high' ? 'secondary' :
                      'outline'
                    } className="text-xs">
                      {insight.severity}
                    </Badge>
                  </div>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Department Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(stats?.byDepartment || {}).map(([dept, count]) => (
          <Card key={dept} className="bg-gradient-to-br from-gray-50 to-gray-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 capitalize">{dept}</p>
                  <p className="text-xl font-bold text-gray-900">{count as number}</p>
                </div>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  dept === 'ophthalmology' ? 'bg-blue-100 text-blue-600' :
                  dept === 'biomedical' ? 'bg-green-100 text-green-600' :
                  dept === 'it' ? 'bg-purple-100 text-purple-600' :
                  'bg-orange-100 text-orange-600'
                }`}>
                  {dept === 'ophthalmology' ? (
                    <Activity className="w-5 h-5" />
                  ) : dept === 'biomedical' ? (
                    <Zap className="w-5 h-5" />
                  ) : dept === 'it' ? (
                    <Shield className="w-5 h-5" />
                  ) : (
                    <Users className="w-5 h-5" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="h-auto p-4 flex flex-col items-center gap-2 bg-blue-600 hover:bg-blue-700">
              <UserPlus className="w-6 h-6" />
              <span>Add New User</span>
              <span className="text-xs opacity-90">Create user account</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <TrendingUp className="w-6 h-6" />
              <span>View Analytics</span>
              <span className="text-xs opacity-70">Detailed insights</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Mail className="w-6 h-6" />
              <span>Send Notifications</span>
              <span className="text-xs opacity-70">Bulk communications</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
