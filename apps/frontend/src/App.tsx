import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [healthStatus, setHealthStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => {
        setHealthStatus(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to fetch health status:', err)
        setLoading(false)
      })
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-8">
          <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">
            Hospitality Scheduler
          </div>
          <h1 className="block mt-1 text-lg leading-tight font-medium text-black">
            Welcome to Your Scheduling App
          </h1>
          <div className="mt-4">
            {loading ? (
              <p className="text-gray-500">Loading...</p>
            ) : healthStatus ? (
              <div className="space-y-2">
                <p className="text-green-600">✅ Backend Connected</p>
                <p className="text-sm text-gray-600">
                  Status: {healthStatus.status}
                </p>
                <p className="text-sm text-gray-600">
                  Message: {healthStatus.message}
                </p>
              </div>
            ) : (
              <p className="text-red-600">❌ Backend Connection Failed</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App