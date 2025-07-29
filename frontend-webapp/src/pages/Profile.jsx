
import React from 'react'
import { useAuth } from '../contexts/AuthContext'

const Profile = () => {
  const { user, getDiscountPercentage, hasActiveSubscription } = useAuth()

  const subscriptionBenefits = [
    'Access to premium products',
    'Exclusive design gallery',
    `${getDiscountPercentage()}% discount on all purchases`,
    'Priority customer support',
    'Early access to new releases'
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* User Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Account Information
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <p className="text-lg text-gray-900">{user?.fullName}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <p className="text-lg text-gray-900">@{user?.username}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telegram ID
              </label>
              <p className="text-lg text-gray-900 font-mono">{user?.telegramId}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Member Since
              </label>
              <p className="text-lg text-gray-900">January 2024</p>
            </div>
          </div>
        </div>

        {/* Subscription Status */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Subscription Status
          </h2>
          
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Status</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  hasActiveSubscription
                    ? 'bg-green-100 text-green-800'
                    : user?.subscriptionStatus === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {user?.subscriptionStatus}
                </span>
              </div>
            </div>
            
            {user?.subscription && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Plan
                </label>
                <p className="text-lg text-gray-900 capitalize">{user.subscription}</p>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount Rate
              </label>
              <p className="text-lg text-indigo-600 font-semibold">
                {getDiscountPercentage()}% OFF
              </p>
            </div>
          </div>
          
          {!hasActiveSubscription && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">
                Your subscription is {user?.subscriptionStatus}. 
                Upgrade through our Telegram bot to access all premium features.
              </p>
            </div>
          )}
        </div>

        {/* Subscription Benefits */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Subscription Benefits
          </h2>
          
          <ul className="space-y-3">
            {subscriptionBenefits.map((benefit, index) => (
              <li key={index} className="flex items-center space-x-3">
                <svg className={`w-5 h-5 ${hasActiveSubscription ? 'text-green-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className={hasActiveSubscription ? 'text-gray-900' : 'text-gray-500'}>
                  {benefit}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Quick Actions
          </h2>
          
          <div className="space-y-3">
            <button className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors">
              Manage Subscription
            </button>
            
            <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
              Contact Support
            </button>
            
            <button className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors">
              Download Invoice
            </button>
            
            <button className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors">
              Back to Telegram Bot
            </button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Your Activity
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600">12</div>
            <div className="text-sm text-gray-600">Products Purchased</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">${calculateTotalSaved()}</div>
            <div className="text-sm text-gray-600">Total Saved</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">8</div>
            <div className="text-sm text-gray-600">Favorites</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">45</div>
            <div className="text-sm text-gray-600">Days Active</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper function to calculate total saved (mock data)
const calculateTotalSaved = () => {
  return 89.50 // Mock value
}

export default Profile
