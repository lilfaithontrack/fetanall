
import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'

const Checkout = () => {
  const { user, getDiscountPercentage } = useAuth()
  const [cart, setCart] = useState([])
  const [paymentMethods, setPaymentMethods] = useState([])
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('')
  const [paymentScreenshot, setPaymentScreenshot] = useState(null)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1) // 1: Review, 2: Payment, 3: Confirmation
  const [orderNumber, setOrderNumber] = useState('')
  const [shippingInfo, setShippingInfo] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  })

  useEffect(() => {
    loadCart()
    fetchPaymentMethods()
  }, [])

  const loadCart = () => {
    const savedCart = localStorage.getItem('fetanCart')
    if (savedCart) {
      setCart(JSON.parse(savedCart))
    }
  }

  const fetchPaymentMethods = async () => {
    try {
      const response = await axios.get('http://0.0.0.0:5000/api/payment-methods')
      setPaymentMethods(response.data.filter(method => method.isActive))
    } catch (error) {
      console.error('Error fetching payment methods:', error)
    }
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

  const handleFileChange = (e) => {
    setPaymentScreenshot(e.target.files[0])
  }

  const handlePlaceOrder = async () => {
    if (!selectedPaymentMethod) {
      alert('Please select a payment method')
      return
    }

    if (!paymentScreenshot) {
      alert('Please upload payment screenshot')
      return
    }

    setLoading(true)

    try {
      const formData = new FormData()
      
      // Order details
      const orderData = {
        items: cart.map(item => ({
          product: item._id,
          quantity: item.quantity,
          price: getDiscountedPrice(item.price)
        })),
        subtotal: calculateSubtotal(),
        discount: calculateDiscountAmount(),
        total: calculateTotal(),
        paymentMethod: selectedPaymentMethod,
        shippingAddress: shippingInfo
      }

      formData.append('orderData', JSON.stringify(orderData))
      formData.append('paymentScreenshot', paymentScreenshot)

      const response = await axios.post('http://0.0.0.0:5000/api/orders', formData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      })

      if (response.data.success) {
        setOrderNumber(response.data.order.orderNumber)
        setStep(3)
        // Clear cart
        localStorage.removeItem('fetanCart')
        setCart([])
      }
    } catch (error) {
      console.error('Error placing order:', error)
      alert('Error placing order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (cart.length === 0 && step === 1) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-8">Add some products to continue with checkout</p>
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

  const selectedMethod = paymentMethods.find(method => method._id === selectedPaymentMethod)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

      {/* Progress Steps */}
      <div className="flex items-center mb-8">
        <div className={`flex items-center ${step >= 1 ? 'text-indigo-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
            step >= 1 ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-gray-300'
          }`}>
            1
          </div>
          <span className="ml-2 font-medium">Review Order</span>
        </div>
        <div className="w-16 h-1 bg-gray-300 mx-4"></div>
        <div className={`flex items-center ${step >= 2 ? 'text-indigo-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
            step >= 2 ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-gray-300'
          }`}>
            2
          </div>
          <span className="ml-2 font-medium">Payment</span>
        </div>
        <div className="w-16 h-1 bg-gray-300 mx-4"></div>
        <div className={`flex items-center ${step >= 3 ? 'text-indigo-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
            step >= 3 ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-gray-300'
          }`}>
            3
          </div>
          <span className="ml-2 font-medium">Confirmation</span>
        </div>
      </div>

      {step === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Items */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Order Items</h2>
            <div className="bg-white rounded-lg shadow-md divide-y divide-gray-200">
              {cart.map((item) => {
                const discountedPrice = getDiscountedPrice(item.price)
                const primaryImage = item.images?.find(img => img.isPrimary) || item.images?.[0]
                
                return (
                  <div key={item._id} className="p-4">
                    <div className="flex items-center space-x-4">
                      <img
                        src={primaryImage ? `http://0.0.0.0:5000${primaryImage.url}` : 'https://via.placeholder.com/80x80'}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-600">{item.category}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="font-bold text-indigo-600">
                            ${discountedPrice.toFixed(2)}
                          </span>
                          <span className="text-sm text-gray-500">x {item.quantity}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">
                          ${(discountedPrice * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Shipping Information */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={shippingInfo.fullName}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, fullName: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={shippingInfo.phone}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <textarea
                      value={shippingInfo.address}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                      rows={3}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      value={shippingInfo.city}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State/Province
                    </label>
                    <input
                      type="text"
                      value={shippingInfo.state}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, state: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="bg-white rounded-lg shadow-md p-6">
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
              
              <button
                onClick={() => setStep(2)}
                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium mt-6 hover:bg-indigo-700 transition-colors"
              >
                Continue to Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="max-w-2xl mx-auto">
          <h2 className="text-xl font-semibold mb-6">Payment Information</h2>
          
          {/* Payment Methods */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-medium mb-4">Select Payment Method</h3>
            <div className="space-y-4">
              {paymentMethods.map((method) => (
                <div
                  key={method._id}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedPaymentMethod === method._id
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onClick={() => setSelectedPaymentMethod(method._id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{method.name}</h4>
                      <p className="text-sm text-gray-600 capitalize">
                        {method.type.replace('_', ' ')} • {method.processingTime}
                      </p>
                    </div>
                    <input
                      type="radio"
                      checked={selectedPaymentMethod === method._id}
                      onChange={() => setSelectedPaymentMethod(method._id)}
                      className="h-4 w-4 text-indigo-600"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Payment Method Details */}
          {selectedMethod && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-lg font-medium mb-4">Payment Details</h3>
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="space-y-2">
                  <div><strong>Account Name:</strong> {selectedMethod.accountName}</div>
                  <div><strong>Account Number:</strong> {selectedMethod.accountNumber}</div>
                  {selectedMethod.bankName && (
                    <div><strong>Bank:</strong> {selectedMethod.bankName}</div>
                  )}
                  <div><strong>Amount to Pay:</strong> ${calculateTotal().toFixed(2)}</div>
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-blue-900 mb-2">Payment Instructions:</h4>
                <p className="text-sm text-blue-800">{selectedMethod.instructions}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Payment Screenshot *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Please upload a clear screenshot of your payment confirmation
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={() => setStep(1)}
              className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
            >
              Back to Review
            </button>
            <button
              onClick={handlePlaceOrder}
              disabled={loading || !selectedPaymentMethod || !paymentScreenshot}
              className="flex-1 bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:bg-gray-400"
            >
              {loading ? 'Processing...' : 'Place Order'}
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Placed Successfully!</h2>
            <p className="text-gray-600 mb-6">
              Thank you for your order. We have received your payment information and will process it shortly.
            </p>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="font-medium">Order Number: <span className="text-indigo-600">{orderNumber}</span></p>
              <p className="text-sm text-gray-600 mt-1">
                You will receive an email confirmation once your payment is verified.
              </p>
            </div>
            
            <div className="flex gap-4 justify-center">
              <a
                href="/products"
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Continue Shopping
              </a>
              <a
                href="/profile"
                className="border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                View Orders
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Checkout
