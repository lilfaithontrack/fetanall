
import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'

const Products = () => {
  const { user, getDiscountPercentage } = useAuth()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [cart, setCart] = useState([])

  useEffect(() => {
    fetchProducts()
    loadCart()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://0.0.0.0:5000/api/products')
      if (response.data.success) {
        setProducts(response.data.products)
    } catch (error) {
      console.error('Failed to fetch products:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCart = () => {
    const savedCart = localStorage.getItem('fetanCart')
    if (savedCart) {
      setCart(JSON.parse(savedCart))
    }
  }

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id)
    let newCart

    if (existingItem) {
      newCart = cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    } else {
      newCart = [...cart, { ...product, quantity: 1 }]
    }

    setCart(newCart)
    localStorage.setItem('fetanCart', JSON.stringify(newCart))
  }

  const getDiscountedPrice = (price) => {
    const discount = getDiscountPercentage()
    return discount > 0 ? price - (price * discount / 100) : price
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Premium Products</h1>
        <p className="text-lg text-gray-600">
          Exclusive digital products for our subscribers
        </p>
        
        {getDiscountPercentage() > 0 && (
          <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 font-medium">
              🎉 Your subscriber discount: {getDiscountPercentage()}% OFF all products!
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => {
          const originalPrice = product.originalPrice || product.price
          const discountedPrice = getDiscountedPrice(product.price)
          const hasDiscount = discountedPrice < product.price
          const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0]

          return (
            <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <img
                src={primaryImage ? `http://0.0.0.0:5000${primaryImage.url}` : 'https://via.placeholder.com/300x200?text=No+Image'}
                alt={product.name}
                className="w-full h-48 object-cover"
              />
              
              <div className="p-6">
                <div className="mb-2">
                  <span className="inline-block bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">
                    {product.category}
                  </span>
                  {product.featured && (
                    <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full ml-2">
                      Featured
                    </span>
                  )}
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {product.name}
                </h3>
                
                <p className="text-gray-600 text-sm mb-4">
                  {product.description}
                </p>
                
                <div className="flex items-center mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product.rating?.average || 0) ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="ml-2 text-sm text-gray-600">
                    {(product.rating?.average || 0).toFixed(1)} ({product.rating?.count || 0} reviews)
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-indigo-600">
                      ${discountedPrice.toFixed(2)}
                    </span>
                    {hasDiscount && (
                      <span className="text-lg text-gray-500 line-through">
                        ${product.price.toFixed(2)}
                      </span>
                    )}
                  </div>
                  
                  <button
                    onClick={() => addToCart(product)}
                    disabled={product.stock <= 0}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      product.stock <= 0 
                        ? 'bg-gray-400 text-white cursor-not-allowed' 
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    {product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                </div>
                
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    Stock: {product.stock}
                  </span>
                  {hasDiscount && (
                    <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      Save ${(product.price - discountedPrice).toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Products
