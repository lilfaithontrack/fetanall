
import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { 
  SparklesIcon, 
  ShoppingBagIcon, 
  PhotoIcon,
  CurrencyDollarIcon 
} from '@heroicons/react/24/outline'

const Home = () => {
  const { user, hasActiveSubscription, getDiscountPercentage } = useAuth()

  const features = [
    {
      icon: ShoppingBagIcon,
      title: 'Premium Products',
      description: 'Access to exclusive digital products and designs'
    },
    {
      icon: PhotoIcon,
      title: 'Design Gallery',
      description: 'Browse our collection of professional designs'
    },
    {
      icon: CurrencyDollarIcon,
      title: 'Member Discounts',
      description: 'Get up to 30% off with active subscriptions'
    },
    {
      icon: SparklesIcon,
      title: 'Premium Quality',
      description: 'High-quality designs crafted by professionals'
    }
  ]

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Welcome to Fetan Design
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-indigo-200">
              Premium Digital Designs & Products
            </p>
            
            {user ? (
              <div className="space-y-4">
                <p className="text-lg">
                  Hello, {user.fullName}! 👋
                </p>
                {hasActiveSubscription ? (
                  <div className="space-y-2">
                    <p className="text-green-200">
                      🎉 You have access to all premium content!
                    </p>
                    <p className="text-lg font-medium">
                      Your discount: {getDiscountPercentage()}% OFF
                    </p>
                    <div className="flex justify-center space-x-4 mt-6">
                      <Link
                        to="/products"
                        className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                      >
                        Shop Products
                      </Link>
                      <Link
                        to="/gallery"
                        className="border border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-white hover:text-indigo-600 transition-colors"
                      >
                        View Gallery
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="bg-yellow-500 bg-opacity-20 border border-yellow-400 rounded-lg p-4 max-w-md mx-auto">
                    <p className="text-yellow-100">
                      Your subscription is {user.subscriptionStatus}. 
                      Please subscribe through our Telegram bot to access premium content.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xl text-indigo-200">
                  Access through our Telegram bot to get started
                </p>
                <div className="bg-white bg-opacity-10 border border-white border-opacity-30 rounded-lg p-4 max-w-md mx-auto">
                  <p className="text-white">
                    Search for @FetanDesignBot on Telegram to begin your journey
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Fetan Design?
            </h2>
            <p className="text-xl text-gray-600">
              Premium features for our valued subscribers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="bg-indigo-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of satisfied customers and get access to premium designs
          </p>
          
          {!user && (
            <div className="bg-white rounded-lg shadow-md p-8 max-w-md mx-auto">
              <h3 className="text-lg font-semibold mb-4">How to Access:</h3>
              <div className="space-y-3 text-left">
                <div className="flex items-center space-x-3">
                  <span className="bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">1</span>
                  <span>Find @FetanDesignBot on Telegram</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">2</span>
                  <span>Register with your phone number</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">3</span>
                  <span>Choose your subscription plan</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">4</span>
                  <span>Get your personalized access link</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Home
