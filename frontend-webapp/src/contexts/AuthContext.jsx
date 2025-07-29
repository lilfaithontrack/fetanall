
import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for Replit auth headers or URL parameters
    checkAuthentication()
  }, [])

  const checkAuthentication = () => {
    // Get user info from URL parameters or headers
    const urlParams = new URLSearchParams(window.location.search)
    const telegramId = urlParams.get('telegram_id')
    const telegramUsername = urlParams.get('telegram_username')
    const telegramName = urlParams.get('telegram_name')
    
    if (telegramId) {
      // Simulate user data from Telegram bot
      const userData = {
        telegramId,
        username: telegramUsername,
        fullName: telegramName,
        subscriptionStatus: urlParams.get('subscription_status') || 'pending',
        subscription: urlParams.get('subscription') || null
      }
      setUser(userData)
    }
    
    setLoading(false)
  }

  const getDiscountPercentage = () => {
    if (!user?.subscription) return 0
    
    // Different discount rates based on subscription
    const discountRates = {
      'basic': 10,
      'premium': 20,
      'pro': 30
    }
    
    return discountRates[user.subscription] || 0
  }

  const value = {
    user,
    loading,
    getDiscountPercentage,
    isAuthenticated: !!user,
    hasActiveSubscription: user?.subscriptionStatus === 'active'
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
