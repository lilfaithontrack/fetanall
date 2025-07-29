
import React from 'react'
import { useAuth } from '../contexts/AuthContext'

const AuthGuard = ({ children }) => {
  const { user, loading, hasActiveSubscription } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Authentication Required
          </h2>
          <p className="text-gray-600 mb-6">
            Please access this page through the Fetan Design Telegram bot.
          </p>
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              1. Go to our Telegram bot
            </p>
            <p className="text-sm text-gray-500">
              2. Register or log in
            </p>
            <p className="text-sm text-gray-500">
              3. Get your access link
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!hasActiveSubscription) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Subscription Required
          </h2>
          <p className="text-gray-600 mb-6">
            You need an active subscription to access this content.
          </p>
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Current Status: <span className="font-medium">{user.subscriptionStatus}</span>
            </p>
            <p className="text-sm text-gray-500">
              Please subscribe through our Telegram bot to get access.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return children
}

export default AuthGuard
