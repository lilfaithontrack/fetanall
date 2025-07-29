
import React, { useState, useEffect } from 'react'

const Gallery = () => {
  const [galleries, setGalleries] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(null)

  useEffect(() => {
    fetchGallery()
  }, [])

  const fetchGallery = async () => {
    try {
      // Mock gallery data
      const mockGallery = [
        {
          id: 1,
          title: 'Modern Logo Collection',
          description: 'A collection of modern, minimalist logo designs',
          image: 'https://via.placeholder.com/400x300?text=Modern+Logos',
          category: 'Logo Design',
          tags: ['modern', 'minimalist', 'corporate']
        },
        {
          id: 2,
          title: 'Brand Identity Package',
          description: 'Complete brand identity with logo, colors, and typography',
          image: 'https://via.placeholder.com/400x300?text=Brand+Identity',
          category: 'Branding',
          tags: ['branding', 'identity', 'complete']
        },
        {
          id: 3,
          title: 'Social Media Templates',
          description: 'Instagram and Facebook post templates',
          image: 'https://via.placeholder.com/400x300?text=Social+Templates',
          category: 'Social Media',
          tags: ['social', 'templates', 'instagram']
        },
        {
          id: 4,
          title: 'Website Mockups',
          description: 'Modern website design mockups and layouts',
          image: 'https://via.placeholder.com/400x300?text=Website+Mockups',
          category: 'Web Design',
          tags: ['web', 'mockup', 'responsive']
        },
        {
          id: 5,
          title: 'Print Design Collection',
          description: 'Business cards, flyers, and brochure designs',
          image: 'https://via.placeholder.com/400x300?text=Print+Design',
          category: 'Print Design',
          tags: ['print', 'business cards', 'brochures']
        },
        {
          id: 6,
          title: 'App UI Designs',
          description: 'Mobile app user interface designs',
          image: 'https://via.placeholder.com/400x300?text=App+UI',
          category: 'Mobile UI',
          tags: ['mobile', 'app', 'ui']
        }
      ]
      
      setGalleries(mockGallery)
    } catch (error) {
      console.error('Failed to fetch gallery:', error)
    } finally {
      setLoading(false)
    }
  }

  const categories = [...new Set(galleries.map(item => item.category))]

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
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Design Gallery</h1>
        <p className="text-lg text-gray-600">
          Explore our collection of professional designs and get inspired
        </p>
      </div>

      {/* Category Filter */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2">
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg">
            All
          </button>
          {categories.map((category) => (
            <button
              key={category}
              className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {galleries.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setSelectedImage(item)}
          >
            <div className="relative">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-4 left-4">
                <span className="bg-indigo-600 text-white px-2 py-1 rounded text-sm">
                  {item.category}
                </span>
              </div>
            </div>
            
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {item.title}
              </h3>
              
              <p className="text-gray-600 text-sm mb-4">
                {item.description}
              </p>
              
              <div className="flex flex-wrap gap-2">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="max-w-4xl w-full bg-white rounded-lg overflow-hidden">
            <div className="relative">
              <img
                src={selectedImage.image}
                alt={selectedImage.title}
                className="w-full h-96 object-cover"
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 bg-white text-gray-800 rounded-full p-2 hover:bg-gray-100"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedImage.title}
                </h2>
                <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm">
                  {selectedImage.category}
                </span>
              </div>
              
              <p className="text-gray-600 mb-4">
                {selectedImage.description}
              </p>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {selectedImage.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
              
              <div className="flex space-x-4">
                <button className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700">
                  Download
                </button>
                <button className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300">
                  Add to Favorites
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Gallery
