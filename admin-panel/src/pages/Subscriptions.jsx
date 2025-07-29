
import React, { useState, useEffect } from 'react'
import axios from 'axios'

const Subscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingSubscription, setEditingSubscription] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    duration: '30',
    features: [],
    discountPercentage: '0',
    maxUsers: ''
  })

  useEffect(() => {
    fetchSubscriptions()
  }, [])

  const fetchSubscriptions = async () => {
    try {
      const response = await axios.get('/api/subscriptions')
      setSubscriptions(response.data)
    } catch (error) {
      console.error('Failed to fetch subscriptions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingSubscription) {
        await axios.put(`/api/subscriptions/${editingSubscription._id}`, formData)
      } else {
        await axios.post('/api/subscriptions', formData)
      }
      
      setShowForm(false)
      setEditingSubscription(null)
      setFormData({
        name: '',
        price: '',
        description: '',
        duration: '30',
        features: [],
        discountPercentage: '0',
        maxUsers: ''
      })
      fetchSubscriptions()
    } catch (error) {
      console.error('Failed to save subscription:', error)
    }
  }

  const handleEdit = (subscription) => {
    setEditingSubscription(subscription)
    setFormData({
      name: subscription.name,
      price: subscription.price.toString(),
      description: subscription.description,
      duration: subscription.duration.toString(),
      features: subscription.features || [],
      discountPercentage: subscription.discountPercentage.toString(),
      maxUsers: subscription.maxUsers?.toString() || ''
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this subscription?')) {
      try {
        await axios.delete(`/api/subscriptions/${id}`)
        fetchSubscriptions()
      } catch (error) {
        console.error('Failed to delete subscription:', error)
      }
    }
  }

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subscriptions</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage subscription plans for your bot users
          </p>
        </div>
        
        <button
          onClick={() => setShowForm(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          Add Subscription
        </button>
      </div>

      {/* Subscription Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">
              {editingSubscription ? 'Edit Subscription' : 'Add New Subscription'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Subscription Name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
              
              <input
                type="number"
                placeholder="Price"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
              
              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md h-20"
                required
              />
              
              <input
                type="number"
                placeholder="Duration (days)"
                value={formData.duration}
                onChange={(e) => setFormData({...formData, duration: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
              
              <input
                type="number"
                placeholder="Discount Percentage"
                value={formData.discountPercentage}
                onChange={(e) => setFormData({...formData, discountPercentage: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md"
                min="0"
                max="100"
              />
              
              <input
                type="number"
                placeholder="Max Users (optional)"
                value={formData.maxUsers}
                onChange={(e) => setFormData({...formData, maxUsers: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
              
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white p-2 rounded-md hover:bg-indigo-700"
                >
                  {editingSubscription ? 'Update' : 'Create'}
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setEditingSubscription(null)
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 p-2 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subscriptions List */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          </div>
        ) : subscriptions.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            No subscriptions found
          </div>
        ) : (
          subscriptions.map((subscription) => (
            <div key={subscription._id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {subscription.name}
                </h3>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  subscription.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {subscription.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              
              <div className="mb-4">
                <p className="text-2xl font-bold text-indigo-600">
                  ${subscription.getDiscountedPrice()}
                  {subscription.discountPercentage > 0 && (
                    <span className="text-sm text-gray-500 line-through ml-2">
                      ${subscription.price}
                    </span>
                  )}
                </p>
                <p className="text-sm text-gray-600">
                  {subscription.duration} days
                </p>
                {subscription.discountPercentage > 0 && (
                  <p className="text-sm text-green-600 font-medium">
                    {subscription.discountPercentage}% OFF!
                  </p>
                )}
              </div>
              
              <p className="text-gray-600 text-sm mb-4">
                {subscription.description}
              </p>
              
              <div className="text-sm text-gray-500 mb-4">
                <p>Current Users: {subscription.currentUsers}</p>
                {subscription.maxUsers && (
                  <p>Max Users: {subscription.maxUsers}</p>
                )}
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(subscription)}
                  className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(subscription._id)}
                  className="flex-1 bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Subscriptions
