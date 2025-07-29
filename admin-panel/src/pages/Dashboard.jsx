
import { useState, useEffect } from 'react'
import axios from 'axios'

const Dashboard = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [recentActivity, setRecentActivity] = useState([])

  useEffect(() => {
    fetchStats()
    fetchRecentActivity()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/users/stats/overview', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        }
      })
      setStats(response.data)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRecentActivity = async () => {
    try {
      const response = await axios.get('/api/users?limit=5', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        }
      })
      setRecentActivity(response.data.users || [])
    } catch (error) {
      console.error('Failed to fetch recent activity:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    )
  }

  const statCards = [
    { title: 'Total Users', value: stats?.totalUsers || 0, color: 'bg-red-500', icon: '👥' },
    { title: 'Registered Users', value: stats?.registeredUsers || 0, color: 'bg-green-500', icon: '✅' },
    { title: 'Active Subscriptions', value: stats?.activeSubscriptions || 0, color: 'bg-purple-500', icon: '💎' },
    { title: 'Pending Payments', value: stats?.pendingPayments || 0, color: 'bg-yellow-500', icon: '⏳' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome to Fetan Design Admin Panel
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <div key={index} className="admin-stat-card p-6 rounded-xl transition-transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full ${stat.color} text-white text-xl`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Subscription Status Chart */}
        <div className="admin-card p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscription Status</h3>
          <div className="space-y-3">
            {stats?.subscriptionStats?.map((stat, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 capitalize">{stat._id}</span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                    <div
                      className="bg-red-600 h-2 rounded-full"
                      style={{ width: `${(stat.count / stats.totalUsers) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{stat.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="admin-card p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Users</h3>
          <div className="space-y-4">
            {recentActivity.map((user, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{user.fullName}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  user.subscriptionStatus === 'active' ? 'admin-badge-active' :
                  user.subscriptionStatus === 'pending' ? 'admin-badge-pending' :
                  'admin-badge-expired'
                }`}>
                  {user.subscriptionStatus}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <button className="admin-button-primary p-4 rounded-lg text-center transition-all hover:scale-105">
            <div className="text-xl mb-2">👥</div>
            <div className="text-sm font-medium">Manage Users</div>
          </button>
          <button className="admin-button-primary p-4 rounded-lg text-center transition-all hover:scale-105">
            <div className="text-xl mb-2">💎</div>
            <div className="text-sm font-medium">Add Subscription</div>
          </button>
          <button className="admin-button-primary p-4 rounded-lg text-center transition-all hover:scale-105">
            <div className="text-xl mb-2">🛍️</div>
            <div className="text-sm font-medium">Add Product</div>
          </button>
          <button className="admin-button-primary p-4 rounded-lg text-center transition-all hover:scale-105">
            <div className="text-xl mb-2">📊</div>
            <div className="text-sm font-medium">View Reports</div>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
