
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'

const Home = () => {
  const { user, hasActiveSubscription, getDiscountPercentage, getAuthHeaders } = useAuth()
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [galleryItems, setGalleryItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFeaturedContent()
  }, [])

  const fetchFeaturedContent = async () => {
    try {
      const [productsRes, galleryRes] = await Promise.all([
        axios.get('/api/products?limit=3&featured=true', {
          headers: getAuthHeaders()
        }),
        axios.get('/api/gallery?limit=4', {
          headers: getAuthHeaders()
        })
      ])
      
      setFeaturedProducts(productsRes.data.products || [])
      setGalleryItems(galleryRes.data.galleries || [])
    } catch (error) {
      console.error('Failed to fetch featured content:', error)
    } finally {
      setLoading(false)
    }
  }

  const discountPercentage = getDiscountPercentage()

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="fetan-hero text-white py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Welcome to <span className="text-red-200">Fetan Design</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-red-100 max-w-3xl mx-auto">
              Premium designs and exclusive content for our valued subscribers
            </p>
            
            {user ? (
              <div className="space-y-6">
                <div className="bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-30 rounded-2xl p-6 max-w-md mx-auto">
                  <h3 className="text-xl font-semibold mb-2">
                    Welcome back, {user.fullName}! 👋
                  </h3>
                  <p className="text-red-100">
                    Subscription Status: <span className="font-medium text-white">{user.subscriptionStatus}</span>
                  </p>
                  {hasActiveSubscription && discountPercentage > 0 && (
                    <p className="text-green-200 mt-2">
                      🎉 You get {discountPercentage}% discount on all products!
                    </p>
                  )}
                </div>
                
                {hasActiveSubscription ? (
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                      to="/products"
                      className="fetan-button-secondary bg-white text-red-600 px-8 py-4 rounded-xl font-semibold hover:bg-red-50 transition-all"
                    >
                      🛍️ Shop Products
                    </Link>
                    <Link
                      to="/gallery"
                      className="fetan-button-secondary bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-red-600 transition-all"
                    >
                      🖼️ View Gallery
                    </Link>
                  </div>
                ) : (
                  <div className="bg-yellow-500 bg-opacity-20 border border-yellow-400 rounded-2xl p-6 max-w-md mx-auto">
                    <p className="text-yellow-100 mb-4">
                      Your subscription is {user.subscriptionStatus}. 
                      Subscribe through our Telegram bot to access premium content.
                    </p>
                    <button className="bg-yellow-500 text-yellow-900 px-6 py-2 rounded-lg font-medium hover:bg-yellow-400 transition-colors">
                      Go to Telegram Bot
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                <p className="text-xl text-red-200">
                  Access through our Telegram bot to get started
                </p>
                <div className="bg-white bg-opacity-10 border border-white border-opacity-30 rounded-2xl p-6 max-w-md mx-auto">
                  <p className="text-white mb-4">
                    Search for @FetanDesignBot on Telegram to begin your journey
                  </p>
                  <div className="text-sm text-red-200">
                    <p>1. Register with your phone number</p>
                    <p>2. Choose a subscription plan</p>
                    <p>3. Get access to premium content</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 w-20 h-20 bg-white bg-opacity-10 rounded-full"></div>
          <div className="absolute bottom-10 right-10 w-32 h-32 bg-white bg-opacity-5 rounded-full"></div>
          <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white bg-opacity-10 rounded-full"></div>
        </div>
      </section>

      {/* Featured Products */}
      {hasActiveSubscription && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Products</h2>
              <p className="text-gray-600">Exclusive designs with your subscriber discount</p>
            </div>
            
            {loading ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
              </div>
            ) : (
              <div className="fetan-product-grid">
                {featuredProducts.map((product) => {
                  const originalPrice = product.price
                  const discountedPrice = originalPrice - (originalPrice * discountPercentage / 100)
                  
                  return (
                    <div key={product._id} className="fetan-card rounded-2xl p-6">
                      <div className="aspect-w-16 aspect-h-9 mb-4">
                        <img
                          src={product.images?.[0]?.url || '/placeholder.jpg'}
                          alt={product.name}
                          className="w-full h-48 object-cover rounded-xl"
                        />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {discountPercentage > 0 ? (
                            <>
                              <span className="text-lg font-bold text-red-600">${discountedPrice.toFixed(2)}</span>
                              <span className="text-sm text-gray-500 line-through">${originalPrice}</span>
                              <span className="fetan-badge-discount">-{discountPercentage}%</span>
                            </>
                          ) : (
                            <span className="text-lg font-bold text-gray-900">${originalPrice}</span>
                          )}
                        </div>
                        <button className="fetan-button-primary px-4 py-2 text-sm">
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
            
            <div className="text-center mt-12">
              <Link
                to="/products"
                className="fetan-button-primary px-8 py-3 rounded-xl inline-block"
              >
                View All Products
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Gallery Preview */}
      {hasActiveSubscription && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Design Gallery</h2>
              <p className="text-gray-600">Latest creative works and inspirations</p>
            </div>
            
            {loading ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {galleryItems.map((item) => (
                  <div key={item._id} className="fetan-card rounded-2xl overflow-hidden">
                    <div className="aspect-w-1 aspect-h-1">
                      <img
                        src={item.image?.url || '/placeholder.jpg'}
                        alt={item.title}
                        className="w-full h-64 object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="text-center mt-12">
              <Link
                to="/gallery"
                className="fetan-button-secondary px-8 py-3 rounded-xl inline-block"
              >
                View Full Gallery
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Fetan Design?</h2>
            <p className="text-gray-600">Premium benefits for our subscribers</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 fetan-gradient rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">🎨</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Premium Designs</h3>
              <p className="text-gray-600">Access to exclusive, high-quality design collections</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 fetan-gradient rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">💰</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Subscriber Discounts</h3>
              <p className="text-gray-600">Get special pricing on all products based on your plan</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 fetan-gradient rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">🚀</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Early Access</h3>
              <p className="text-gray-600">Be the first to see new collections and products</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
