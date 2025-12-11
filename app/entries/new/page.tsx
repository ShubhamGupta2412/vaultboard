'use client'

/**
 * Create New Entry Page
 * 
 * Form to create a new knowledge entry with all fields
 */

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Logo from '@/components/Logo'

export default function NewEntryPage() {
  const router = useRouter()
  
  // Form state
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState<'credential' | 'sop' | 'link' | 'document'>('document')
  const [classification, setClassification] = useState<'public' | 'internal' | 'confidential' | 'restricted'>('internal')
  const [tags, setTags] = useState('')
  const [isSensitive, setIsSensitive] = useState(false)
  const [expirationDate, setExpirationDate] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!title || !content || !category) {
      setError('Title, content, and category are required')
      return
    }

    setIsLoading(true)

    try {
      let fileUrl = null
      let fileName = null

      // Upload file if present (especially for document category)
      if (file && category === 'document') {
        const formData = new FormData()
        formData.append('file', file)

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload file')
        }

        const uploadData = await uploadResponse.json()
        fileUrl = uploadData.url
        fileName = uploadData.fileName
      }

      // Parse tags (comma-separated)
      const tagArray = tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)

      const response = await fetch('/api/entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content,
          category,
          classification,
          tags: tagArray,
          is_sensitive: isSensitive,
          expiration_date: expirationDate || null,
          file_url: fileUrl,
          file_name: fileName,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create entry')
      }

      // Redirect to the new entry or dashboard
      router.push(`/entries/${data.data.id}`)
      router.refresh()
    } catch (err: any) {
      console.error('Create entry error:', err)
      setError(err.message || 'An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Logo size="sm" showText={false} />
              <h1 className="text-2xl font-bold text-slate-900">Create New Entry</h1>
            </div>
            <Link
              href="/dashboard"
              className="text-slate-600 hover:text-slate-900 text-sm font-medium"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 text-sm">
                <p className="font-medium">Error</p>
                <p>{error}</p>
              </div>
            )}

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-slate-900"
                placeholder="Enter entry title"
                required
                disabled={isLoading}
              />
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-slate-900"
                required
                disabled={isLoading}
              >
                <option value="document">Document</option>
                <option value="credential">Credential</option>
                <option value="sop">SOP (Standard Operating Procedure)</option>
                <option value="link">Link/Reference</option>
              </select>
            </div>

            {/* Classification */}
            <div>
              <label htmlFor="classification" className="block text-sm font-medium text-slate-700 mb-2">
                Classification <span className="text-red-500">*</span>
              </label>
              <select
                id="classification"
                value={classification}
                onChange={(e) => setClassification(e.target.value as any)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-slate-900"
                required
                disabled={isLoading}
              >
                <option value="public">Public - Visible to all users</option>
                <option value="internal">Internal - Visible to members and above</option>
                <option value="confidential">Confidential - Visible to managers and admins</option>
                <option value="restricted">Restricted - Visible to admins only</option>
              </select>
            </div>

            {/* Content */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-slate-700 mb-2">
                Content <span className="text-red-500">*</span>
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={10}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-slate-900 resize-none"
                placeholder="Enter entry content..."
                required
                disabled={isLoading}
              />
            </div>

            {/* Tags */}
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-slate-700 mb-2">
                Tags
              </label>
              <input
                id="tags"
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-slate-900"
                placeholder="Enter tags separated by commas (e.g., aws, database, api)"
                disabled={isLoading}
              />
              <p className="mt-1 text-xs text-slate-500">
                Separate tags with commas
              </p>
            </div>

            {/* File Upload (for document category) */}
            {category === 'document' && (
              <div>
                <label htmlFor="file" className="block text-sm font-medium text-slate-700 mb-2">
                  Attach Document (Optional)
                </label>
                <input
                  id="file"
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-slate-900 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                  disabled={isLoading}
                  accept=".pdf,.doc,.docx,.txt,.md,.xlsx,.xls,.csv,.zip"
                />
                <p className="mt-1 text-xs text-slate-500">
                  Supported formats: PDF, DOC, DOCX, TXT, MD, XLSX, XLS, CSV, ZIP (Max 10MB)
                </p>
                {file && (
                  <p className="mt-2 text-sm text-teal-600">
                    Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>
            )}

            {/* Sensitive Checkbox */}
            <div className="flex items-start">
              <input
                id="sensitive"
                type="checkbox"
                checked={isSensitive}
                onChange={(e) => setIsSensitive(e.target.checked)}
                className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-slate-300 rounded mt-1"
                disabled={isLoading}
              />
              <label htmlFor="sensitive" className="ml-3 text-sm text-slate-700">
                <span className="font-medium">Mark as sensitive</span>
                <p className="text-slate-500">
                  Sensitive content will be masked in list views (useful for passwords, API keys, etc.)
                </p>
              </label>
            </div>

            {/* Expiration Date */}
            <div>
              <label htmlFor="expiration" className="block text-sm font-medium text-slate-700 mb-2">
                Expiration Date (Optional)
              </label>
              <input
                id="expiration"
                type="date"
                value={expirationDate}
                onChange={(e) => setExpirationDate(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-slate-900"
                disabled={isLoading}
              />
              <p className="mt-1 text-xs text-slate-500">
                Set a date when this entry should expire or be reviewed
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Creating...
                  </span>
                ) : (
                  'Create Entry'
                )}
              </button>
              <Link
                href="/dashboard"
                className="flex-1 text-center bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 px-6 rounded-lg transition-all duration-200"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
