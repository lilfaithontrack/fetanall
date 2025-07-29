
import { useState } from 'react'
import axios from 'axios'

export default function TelegramTest() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const testTelegram = async () => {
    setLoading(true)
    try {
      const response = await axios.get('http://0.0.0.0:5000/api/telegram/test')
      setResult(response.data)
    } catch (error) {
      setResult({
        success: false,
        error: error.response?.data?.error || error.message
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Telegram Bot Test</h1>
        <p className="mt-2 text-gray-600">
          Test the telegram bot integration
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <button
          onClick={testTelegram}
          disabled={loading}
          className="admin-button-primary px-6 py-3 rounded-lg font-medium"
        >
          {loading ? '⏳ Testing...' : '🤖 Test Telegram Bot'}
        </button>

        {result && (
          <div className={`mt-6 p-4 rounded-lg ${
            result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <h3 className={`font-semibold ${
              result.success ? 'text-green-800' : 'text-red-800'
            }`}>
              {result.success ? '✅ Success!' : '❌ Error!'}
            </h3>
            <pre className="mt-2 text-sm text-gray-700">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
