
import { useState, useEffect } from 'react'
import axios from 'axios'

export default function PaymentMethods() {
  const [paymentMethods, setPaymentMethods] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingMethod, setEditingMethod] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    type: 'bank',
    accountNumber: '',
    accountName: '',
    bankName: '',
    instructions: '',
    minimumAmount: '',
    maximumAmount: '',
    processingTime: 'Instant',
    isActive: true
  })

  useEffect(() => {
    fetchPaymentMethods()
  }, [])

  const fetchPaymentMethods = async () => {
    try {
      const response = await axios.get('http://0.0.0.0:5000/api/payment-methods')
      setPaymentMethods(response.data)
    } catch (error) {
      console.error('Error fetching payment methods:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem('adminToken')
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      }

      const dataToSend = {
        ...formData,
        minimumAmount: formData.minimumAmount ? parseFloat(formData.minimumAmount) : 0,
        maximumAmount: formData.maximumAmount ? parseFloat(formData.maximumAmount) : null
      }

      if (editingMethod) {
        await axios.put(`http://0.0.0.0:5000/api/payment-methods/${editingMethod._id}`, dataToSend, config)
      } else {
        await axios.post('http://0.0.0.0:5000/api/payment-methods', dataToSend, config)
      }

      setFormData({
        name: '',
        type: 'bank',
        accountNumber: '',
        accountName: '',
        bankName: '',
        instructions: '',
        minimumAmount: '',
        maximumAmount: '',
        processingTime: 'Instant',
        isActive: true
      })
      setShowCreateForm(false)
      setEditingMethod(null)
      fetchPaymentMethods()
    } catch (error) {
      console.error('Error saving payment method:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (methodId) => {
    if (!confirm('Are you sure you want to delete this payment method?')) return

    try {
      const token = localStorage.getItem('adminToken')
      await axios.delete(`http://0.0.0.0:5000/api/payment-methods/${methodId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchPaymentMethods()
    } catch (error) {
      console.error('Error deleting payment method:', error)
    }
  }

  const handleEdit = (method) => {
    setEditingMethod(method)
    setFormData({
      name: method.name,
      type: method.type,
      accountNumber: method.accountNumber,
      accountName: method.accountName,
      bankName: method.bankName || '',
      instructions: method.instructions,
      minimumAmount: method.minimumAmount?.toString() || '',
      maximumAmount: method.maximumAmount?.toString() || '',
      processingTime: method.processingTime || 'Instant',
      isActive: method.isActive
    })
    setShowCreateForm(true)
  }

  if (loading && paymentMethods.length === 0) {
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
    </div>
  }

  const paymentTypeOptions = [
    { value: 'bank', label: 'Bank Transfer' },
    { value: 'mobile_money', label: 'Mobile Money' },
    { value: 'crypto', label: 'Cryptocurrency' },
    { value: 'other', label: 'Other' }
  ]

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payment Methods</h1>
          <p className="mt-2 text-gray-600">
            Manage available payment methods for customers
          </p>
        </div>
        <button
          onClick={() => {
            setShowCreateForm(true)
            setEditingMethod(null)
            setFormData({
              name: '',
              type: 'bank',
              accountNumber: '',
              accountName: '',
              bankName: '',
              instructions: '',
              minimumAmount: '',
              maximumAmount: '',
              processingTime: 'Instant',
              isActive: true
            })
          }}
          className="admin-button-primary px-6 py-3 rounded-lg font-medium"
        >
          ➕ Add Payment Method
        </button>
      </div>

      {showCreateForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingMethod ? 'Edit Payment Method' : 'Add New Payment Method'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Method Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="e.g., CBE Bank, M-Pesa"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                >
                  {paymentTypeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Number
                </label>
                <input
                  type="text"
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Name
                </label>
                <input
                  type="text"
                  value={formData.accountName}
                  onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
              </div>

              {formData.type === 'bank' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Processing Time
                </label>
                <input
                  type="text"
                  value={formData.processingTime}
                  onChange={(e) => setFormData({ ...formData, processingTime: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="e.g., Instant, 1-2 hours, 24 hours"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Amount ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.minimumAmount}
                  onChange={(e) => setFormData({ ...formData, minimumAmount: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Amount ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.maximumAmount}
                  onChange={(e) => setFormData({ ...formData, maximumAmount: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Leave empty for no limit"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Instructions
              </label>
              <textarea
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Provide detailed instructions for customers on how to make payments..."
                required
              />
            </div>

            <div className="flex items-center mt-4">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                Active (available for customers)
              </label>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                type="submit"
                disabled={loading}
                className="admin-button-primary px-6 py-3 rounded-lg font-medium"
              >
                {loading ? 'Saving...' : (editingMethod ? 'Update Method' : 'Add Method')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false)
                  setEditingMethod(null)
                }}
                className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Account Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Limits
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paymentMethods.map((method) => (
                <tr key={method._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {method.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        Processing: {method.processingTime}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                      {method.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>{method.accountName}</div>
                    <div className="font-mono">{method.accountNumber}</div>
                    {method.bankName && <div className="text-xs">{method.bankName}</div>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>Min: ${method.minimumAmount}</div>
                    <div>Max: {method.maximumAmount ? `$${method.maximumAmount}` : 'No limit'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      method.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {method.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(method)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(method._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
