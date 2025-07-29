
import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'

const Cart = () => {
  const { user, getDiscountPercentage } = useAuth()
  const [cart, setCart] = useState([])

  useEffect(() => {
    loadCart()
  }, [])

  const loadCart = () => {
    const savedCart = localStorage.getItem('fetanCart')
    if (savedCart) {
      setCart(JSON.parse(savedCart))
    }
  }

  const updateCart = (newCart) => {
    setCart(newCart)
    localStorage.setItem('fetanCart', JSON.stringify(newCart))
  }

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(id)
      return
    }

    const newCart = cart.map(item =>
      item.id === id ? { ...item, quantity: newQuantity } : item
    )
    updateCart(newCart)
  }

  const removeFromCart = (id) => {
    const newCart = cart.filter(item => item.id !== id)
    updateCart(newCart)
  }

  const clearCart = () => {
    updateCart([])
  }

  const getDiscountedPrice = (price) => {
    const discount = getDiscountPercentage()
    return discount > 0 ? price - (price * discount / 100) : price
  }

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  }

  const calculateDiscountAmount = () => {
    const subtotal = calculateSubtotal()
    const discount = getDiscountPercentage()
    return discount > 0 ? subtotal * discount / 100 : 0
  }

  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    const discountAmount = calculateDiscountAmount()
    return subtotal - discountAmount
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-16">
          <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5H21M7 13v6a2 2 0 002 2h6a2 2 0 002-2v-6" />
          </svg>
          <h2 className="text-2xl font-bold text-gray-900 mt-4 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-8">Add some amazing products to get started!</p>
          <a
            href="/products"
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Browse Products
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">
                  Cart Items ({cart.length})
                </h2>
                <button
                  onClick={clearCart}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Clear Cart
                </button>
              </div>
            </div>

            <div className="divide-y divide-gray-200">
              {cart.map((item) => {
                const originalPrice = item.price
                const discountedPrice = getDiscountedPrice(originalPrice)
                const hasDiscount = discountedPrice < originalPrice

                return (
                  <div key={item.id} className="p-6">
                    <div className="flex items-center space-x-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900">
                          {item.name}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {item.category}
                        </p>
                        
                        <div className="flex items-center space-x-2 mt-2">
                          <span className="text-lg font-bold text-indigo-600">
                            ${discountedPrice.toFixed(2)}
                          </span>
                          {hasDiscount && (
                            <span className="text-sm text-gray-500 line-through">
                              ${originalPrice.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                        >
                          -
                        </button>
                        
                        <span className="text-lg font-medium w-8 text-center">
                          {item.quantity}
                        </span>
                        
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                        >
                          +
                        </button>
                        
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="ml-4 text-red-600 hover:text-red-800"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Order Summary
            </h2>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">${calculateSubtotal().toFixed(2)}</span>
              </div>
              
              {getDiscountPercentage() > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Subscriber Discount ({getDiscountPercentage()}%)</span>
                  <span>-${calculateDiscountAmount().toFixed(2)}</span>
                </div>
              )}
              
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span className="text-indigo-600">${calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            {getDiscountPercentage() > 0 && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 text-sm font-medium">
                  🎉 You saved ${calculateDiscountAmount().toFixed(2)} with your subscription!
                </p>
              </div>
            )}
            
            <a
              href="/checkout"
              className="block w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium mt-6 hover:bg-indigo-700 transition-colors text-center"
            >
              Proceed to Checkout
            </a>
            
            <p className="text-xs text-gray-500 text-center mt-4">
              Secure checkout powered by Telegram payments
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart
