
import React, { useState, useEffect } from 'react'
import axios from 'axios'

const Users = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({})
  const [currentPage, setCurrentPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [currentPage, search, statusFilter])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const params = {
        page: currentPage,
        limit: 10,
        search,
        status: statusFilter
      }
      
      const response = await axios.get('/api/users', { params })
      setUsers(response.data.users)
      setPagination(response.data.pagination)
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (userId, newStatus) => {
    try {
      await axios.put(`/api/users/${userId}`, {
        subscriptionStatus: newStatus
      })
      fetchUsers()
    } catch (error) {
      console.error('Failed to update user status:', error)
    }
  }

  const approvePayment = async (userId, screenshotId) => {
    try {
      await axios.post(`/api/users/${userId}/approve-payment`, {
        screenshotId
      })
      fetchUsers()
    } catch (error) {
      console.error('Failed to approve payment:', error)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
        <p className="mt-1 text-sm text-gray-600">
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
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {loading ? (
            <li className="px-6 py-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            </li>
          ) : users.length === 0 ? (
            <li className="px-6 py-8 text-center text-gray-500">
              No users found
            </li>
          ) : (
            users.map((user) => (
              <li key={user._id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {user.fullName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {user.phone} • @{user.username}
                      </p>
                      <p className="text-xs text-gray-400">
                        Joined {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-900">
                        {user.subscription?.name || 'No subscription'}
                      </p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.subscriptionStatus === 'active' 
                          ? 'bg-green-100 text-green-800'
                          : user.subscriptionStatus === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.subscriptionStatus}
                      </span>
                    </div>
                    
                    <select
                      value={user.subscriptionStatus}
                      onChange={(e) => handleStatusUpdate(user._id, e.target.value)}
                      className="text-sm border-gray-300 rounded-md"
                    >
                      <option value="pending">Pending</option>
                      <option value="active">Active</option>
                      <option value="expired">Expired</option>
                    </select>
                  </div>
                </div>
                
                {/* Payment Screenshots */}
                {user.paymentScreenshots?.filter(s => s.status === 'pending').length > 0 && (
                  <div className="mt-4 p-3 bg-yellow-50 rounded-md">
                    <p className="text-sm font-medium text-yellow-800 mb-2">
                      Pending payment screenshots:
                    </p>
                    <div className="flex space-x-2">
                      {user.paymentScreenshots
                        .filter(s => s.status === 'pending')
                        .map((screenshot) => (
                        <button
                          key={screenshot._id}
                          onClick={() => approvePayment(user._id, screenshot._id)}
                          className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                        >
                          Approve Payment
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </li>
            ))
          )}
        </ul>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-6 flex justify-between items-center">
          <p className="text-sm text-gray-700">
            Showing {((currentPage - 1) * pagination.limit) + 1} to {Math.min(currentPage * pagination.limit, pagination.total)} of {pagination.total} results
          </p>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-md disabled:opacity-50"
            >
              Previous
            </button>
            
            <span className="px-3 py-2 text-sm bg-indigo-600 text-white rounded-md">
              {currentPage}
            </span>
            
            <button
              onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
              disabled={currentPage === pagination.totalPages}
              className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-md disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Users
