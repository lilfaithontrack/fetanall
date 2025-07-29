
import { useState, useEffect } from 'react'
import axios from 'axios'

const Users = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })
  const [selectedUser, setSelectedUser] = useState(null)
  const [showUserModal, setShowUserModal] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [pagination.page, search, statusFilter])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/users', {
        params: {
          page: pagination.page,
          limit: pagination.limit,
          search,
          status: statusFilter
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        }
      })
      setUsers(response.data.users)
      setPagination(prev => ({
        ...prev,
        total: response.data.pagination.total,
        totalPages: response.data.pagination.totalPages
      }))
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUserClick = async (userId) => {
    try {
      const response = await axios.get(`/api/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        }
      })
      setSelectedUser(response.data)
      setShowUserModal(true)
    } catch (error) {
      console.error('Failed to fetch user details:', error)
    }
  }

  const handleApprovePayment = async (userId, screenshotId) => {
    try {
      await axios.post(`/api/users/${userId}/approve-payment`, 
        { screenshotId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`
          }
        }
      )
      fetchUsers()
      alert('Payment approved successfully!')
    } catch (error) {
      console.error('Failed to approve payment:', error)
      alert('Failed to approve payment')
    }
  }

  const handleUpdateUserStatus = async (userId, status) => {
    try {
      await axios.put(`/api/users/${userId}`, 
        { subscriptionStatus: status },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`
          }
        }
      )
      fetchUsers()
      setShowUserModal(false)
      alert('User status updated successfully!')
    } catch (error) {
      console.error('Failed to update user:', error)
      alert('Failed to update user status')
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Users Management</h1>
        <p className="mt-2 text-gray-600">
          Manage bot users, subscriptions, and payments
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="block w-full rounded-lg border-red-200 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
        />
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="block w-full rounded-lg border-red-200 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="expired">Expired</option>
        </select>

        <button 
          onClick={fetchUsers}
          className="admin-button-primary px-4 py-2 rounded-lg font-medium"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Users Table */}
      <div className="admin-table">
        <table className="min-w-full divide-y divide-red-200">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Phone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Subscription
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Joined
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-red-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
                </td>
              </tr>
            ) : users.map((user) => (
              <tr key={user._id} className="hover:bg-red-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                    <div className="text-sm text-gray-500">@{user.username || 'N/A'}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.phone}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    user.subscriptionStatus === 'active' ? 'admin-badge-active' :
                    user.subscriptionStatus === 'pending' ? 'admin-badge-pending' :
                    'admin-badge-expired'
                  }`}>
                    {user.subscriptionStatus}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.subscription?.name || 'None'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleUserClick(user._id)}
                    className="text-red-600 hover:text-red-900 mr-3"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleUpdateUserStatus(user._id, 'active')}
                    className="text-green-600 hover:text-green-900"
                  >
                    Activate
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            disabled={pagination.page === 1}
            className="px-3 py-2 text-sm border border-red-200 rounded-lg disabled:opacity-50 hover:bg-red-50"
          >
            Previous
          </button>
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            disabled={pagination.page === pagination.totalPages}
            className="px-3 py-2 text-sm border border-red-200 rounded-lg disabled:opacity-50 hover:bg-red-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-90vh overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">User Details</h2>
              <button
                onClick={() => setShowUserModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Full Name</label>
                  <p className="text-gray-900">{selectedUser.fullName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Phone</label>
                  <p className="text-gray-900">{selectedUser.phone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Telegram ID</label>
                  <p className="text-gray-900">{selectedUser.telegramId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Referral Code</label>
                  <p className="text-gray-900">{selectedUser.referralCode || 'N/A'}</p>
                </div>
              </div>

              {selectedUser.paymentScreenshots && selectedUser.paymentScreenshots.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Payment Screenshots</h3>
                  <div className="space-y-3">
                    {selectedUser.paymentScreenshots.map((screenshot, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border border-red-200 rounded-lg">
                        <div>
                          <p className="text-sm text-gray-600">
                            Uploaded: {new Date(screenshot.uploadedAt).toLocaleDateString()}
                          </p>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            screenshot.status === 'approved' ? 'admin-badge-active' :
                            screenshot.status === 'pending' ? 'admin-badge-pending' :
                            'admin-badge-expired'
                          }`}>
                            {screenshot.status}
                          </span>
                        </div>
                        {screenshot.status === 'pending' && (
                          <button
                            onClick={() => handleApprovePayment(selectedUser._id, screenshot._id)}
                            className="admin-button-primary px-3 py-1 text-xs rounded"
                          >
                            Approve
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Users
