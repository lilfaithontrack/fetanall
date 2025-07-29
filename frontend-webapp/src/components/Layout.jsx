
import React from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  HomeIcon,
  ShoppingBagIcon,
  PhotoIcon,
  ShoppingCartIcon,
  UserIcon
} from '@heroicons/react/24/outline'

const Layout = () => {
  const { user, hasActiveSubscription } = useAuth()
  const location = useLocation()

  const navigation = [
    { name: 'Home', href: '/', icon: HomeIcon, public: true },
    { name: 'Products', href: '/products', icon: ShoppingBagIcon, public: false },
    { name: 'Gallery', href: '/gallery', icon: PhotoIcon, public: false },
    { name: 'Cart', href: '/cart', icon: ShoppingCartIcon, public: false },
    { name: 'Profile', href: '/profile', icon: UserIcon, public: false },
  ]

  const filteredNavigation = navigation.filter(item => 
    item.public || (user && hasActiveSubscription)
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-bold text-indigo-600">
                Fetan Design
              </Link>
            </div>
            
            <nav className="hidden md:flex space-x-8">
              {filteredNavigation.map((item) => {
                const isActive = location.pathname === item.href
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? 'text-indigo-600 bg-indigo-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <item.icon className="w-5 h-5 mr-2" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>

            {user && (
              <div className="flex items-center space-x-4">
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                  hasActiveSubscription
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {user.subscriptionStatus}
                </span>
                <span className="text-sm text-gray-700">
                  {user.fullName}
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <nav className="md:hidden bg-white border-t border-gray-200 fixed bottom-0 left-0 right-0 z-50">
        <div className="flex">
          {filteredNavigation.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex-1 flex flex-col items-center py-2 px-1 ${
                  isActive
                    ? 'text-indigo-600'
                    : 'text-gray-600'
                }`}
              >
                <item.icon className="w-6 h-6" />
                <span className="text-xs mt-1">{item.name}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Main Content */}
      <main className="pb-20 md:pb-0">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
