'use client'

/**
 * Storage Setup Test Page
 * /test-storage
 */

import { useState } from 'react'

export default function TestStoragePage() {
  const [status, setStatus] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [testFile, setTestFile] = useState<File | null>(null)
  const [uploadResult, setUploadResult] = useState<any>(null)

  const checkStorage = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/setup-storage')
      const data = await response.json()
      setStatus(data)
    } catch (error: any) {
      setStatus({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  const setupStorage = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/setup-storage', { method: 'POST' })
      const data = await response.json()
      setStatus(data)
    } catch (error: any) {
      setStatus({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  const testUpload = async () => {
    if (!testFile) return
    
    setLoading(true)
    setUploadResult(null)
    try {
      const formData = new FormData()
      formData.append('file', testFile)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()
      setUploadResult(data)
    } catch (error: any) {
      setUploadResult({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-4">Storage Setup & Testing</h1>
          
          <div className="space-y-4">
            <button
              onClick={checkStorage}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              Check Storage Status
            </button>

            <button
              onClick={setupStorage}
              disabled={loading}
              className="ml-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              Create Storage Bucket
            </button>
          </div>

          {status && (
            <div className="mt-4 p-4 bg-slate-100 rounded">
              <h3 className="font-semibold mb-2">Status:</h3>
              <pre className="text-xs overflow-auto">{JSON.stringify(status, null, 2)}</pre>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Test File Upload</h2>
          
          <div className="space-y-4">
            <input
              type="file"
              onChange={(e) => setTestFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-slate-500
                file:mr-4 file:py-2 file:px-4
                file:rounded file:border-0
                file:text-sm file:font-semibold
                file:bg-teal-50 file:text-teal-700
                hover:file:bg-teal-100"
            />

            {testFile && (
              <button
                onClick={testUpload}
                disabled={loading}
                className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 disabled:opacity-50"
              >
                Upload Test File
              </button>
            )}
          </div>

          {uploadResult && (
            <div className="mt-4 p-4 bg-slate-100 rounded">
              <h3 className="font-semibold mb-2">Upload Result:</h3>
              <pre className="text-xs overflow-auto">{JSON.stringify(uploadResult, null, 2)}</pre>
              
              {uploadResult.url && (
                <a
                  href={uploadResult.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-blue-600 underline"
                >
                  View Uploaded File
                </a>
              )}
            </div>
          )}
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="font-bold text-yellow-800 mb-2">Manual Setup Instructions:</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-yellow-900">
            <li>Go to your Supabase Dashboard</li>
            <li>Navigate to Storage section</li>
            <li>Click "Create a new bucket"</li>
            <li>Name it: <code className="bg-yellow-100 px-1">documents</code></li>
            <li>Set it to <strong>Public</strong></li>
            <li>Click Create</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
