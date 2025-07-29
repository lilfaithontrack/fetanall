
import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

// Configure axios base URL
axios.defaults.baseURL = 'http://0.0.0.0:5000'

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
    checkAuthentication()
  }, [])

  const checkAuthentication = async () => {
    try {
      // Get user info from URL parameters (passed from Telegram bot)
      const urlParams = new URLSearchParams(window.location.search)
      const telegramId = urlParams.get('telegram_id')
      const authToken = urlParams.get('auth_token')
      
      if (telegramId && authToken) {
        // Verify the user with backend
        const response = await axios.get(`/api/users/telegram/${telegramId}`, {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        })
        
        if (response.data.success) {
          const userData = response.data.user
          setUser(userData)
          
          // Store for future requests
          localStorage.setItem('telegramId', telegramId)
          localStorage.setItem('authToken', authToken)
        }
      } else {
        // Check if we have stored credentials
        const storedTelegramId = localStorage.getItem('telegramId')
        const storedAuthToken = localStorage.getItem('authToken')
        
        if (storedTelegramId && storedAuthToken) {
          const response = await axios.get(`/api/users/telegram/${storedTelegramId}`, {
            headers: {
              Authorization: `Bearer ${storedAuthToken}`
            }
          })
          
          if (response.data.success) {
            setUser(response.data.user)
          } else {
            // Clear invalid credentials
            localStorage.removeItem('telegramId')
            localStorage.removeItem('authToken')
          }
        }
      }
    } catch (error) {
      console.error('Authentication check failed:', error)
      // Clear invalid credentials
      localStorage.removeItem('telegramId')
      localStorage.removeItem('authToken')
    } finally {
      setLoading(false)
    }
  }

  const getDiscountPercentage = () => {
    if (!user?.subscription) return 0
    
    // Get discount based on subscription level
    const subscription = user.subscription
    return subscription.discountPercentage || 0
  }

  const hasActiveSubscription = user?.subscriptionStatus === 'active' && 
    user?.subscriptionExpiry && 
    new Date(user.subscriptionExpiry) > new Date()

  const getAuthHeaders = () => {
    const authToken = localStorage.getItem('authToken')
    return authToken ? { Authorization: `Bearer ${authToken}` } : {}
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('telegramId')
    localStorage.removeItem('authToken')
  }

  const value = {
    user,
    loading,
    hasActiveSubscription,
    getDiscountPercentage,
    getAuthHeaders,
    logout,
    refreshUser: checkAuthentication
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
