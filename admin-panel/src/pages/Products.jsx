
import { useState, useEffect } from 'react'
import axios from 'axios'

export default function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    category: '',
    tags: '',
    stock: '',
    featured: false,
    isActive: true
  })
  const [selectedImages, setSelectedImages] = useState([])

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://0.0.0.0:5000/api/products', {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
      })
      setProducts(response.data)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = (e) => {
    setSelectedImages(Array.from(e.target.files))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('name', formData.name)
      formDataToSend.append('description', formData.description)
      formDataToSend.append('price', formData.price)
      formDataToSend.append('originalPrice', formData.originalPrice)
      formDataToSend.append('category', formData.category)
      formDataToSend.append('tags', formData.tags.split(',').map(tag => tag.trim()))
      formDataToSend.append('stock', formData.stock)
      formDataToSend.append('featured', formData.featured)
      formDataToSend.append('isActive', formData.isActive)

      selectedImages.forEach((image, index) => {
        formDataToSend.append('images', image)
        formDataToSend.append(`alt_${index}`, formData.name)
      })

      const token = localStorage.getItem('adminToken')
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      }

      if (editingProduct) {
        await axios.put(`http://0.0.0.0:5000/api/products/${editingProduct._id}`, formDataToSend, config)
      } else {
        await axios.post('http://0.0.0.0:5000/api/products', formDataToSend, config)
      }

      setFormData({
        name: '',
        description: '',
        price: '',
        originalPrice: '',
        category: '',
        tags: '',
        stock: '',
        featured: false,
        isActive: true
      })
      setSelectedImages([])
      setShowCreateForm(false)
      setEditingProduct(null)
      fetchProducts()
    } catch (error) {
      console.error('Error saving product:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      const token = localStorage.getItem('adminToken')
      await axios.delete(`http://0.0.0.0:5000/api/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchProducts()
    } catch (error) {
      console.error('Error deleting product:', error)
    }
  }

  const handleEdit = (product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      originalPrice: product.originalPrice.toString(),
      category: product.category,
      tags: product.tags?.join(', ') || '',
      stock: product.stock.toString(),
      featured: product.featured,
      isActive: product.isActive
    })
    setShowCreateForm(true)
  }

  if (loading && products.length === 0) {
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
    </div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products Management</h1>
          <p className="mt-2 text-gray-600">
            Manage your product catalog
          </p>
        </div>
        <button
          onClick={() => {
            setShowCreateForm(true)
            setEditingProduct(null)
            setFormData({
              name: '',
              description: '',
              price: '',
              originalPrice: '',
              category: '',
              tags: '',
              stock: '',
              featured: false,
              isActive: true
            })
          }}
          className="admin-button-primary px-6 py-3 rounded-lg font-medium"
        >
          ➕ Add Product
        </button>
      </div>

      {showCreateForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingProduct ? 'Edit Product' : 'Add New Product'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Original Price ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.originalPrice}
                  onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock
                </label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="design, logo, template"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Images
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-1">Select multiple images</p>
            </div>

            <div className="flex items-center gap-6 mt-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                />
                <label htmlFor="featured" className="ml-2 block text-sm text-gray-900">
                  Featured Product
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                  Active (visible to customers)
                </label>
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                type="submit"
                disabled={loading}
                className="admin-button-primary px-6 py-3 rounded-lg font-medium"
              >
                {loading ? 'Saving...' : (editingProduct ? 'Update Product' : 'Add Product')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false)
                  setEditingProduct(null)
                }}
                className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pricing
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {product.images && product.images.length > 0 && (
                        <img
                          src={`http://0.0.0.0:5000${product.images[0].url}`}
                          alt={product.name}
                          className="h-10 w-10 rounded-lg object-cover mr-3"
                        />
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {product.name}
                        </div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {product.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>${product.price}</div>
                    {product.originalPrice !== product.price && (
                      <div className="text-xs text-gray-400 line-through">
                        ${product.originalPrice}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.stock}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        product.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.isActive ? 'Active' : 'Inactive'}
                      </span>
                      {product.featured && (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Featured
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
