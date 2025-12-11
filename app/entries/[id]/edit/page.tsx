'use client'

/**
 * Edit Entry Page
 * 
 * Form to update an existing knowledge entry
 */

import { useState, useEffect, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function EditEntryPage({ params }: PageProps) {
  const router = useRouter()
  const [entryId, setEntryId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  
  // Form state
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState<'credential' | 'sop' | 'link' | 'document'>('document')
  const [classification, setClassification] = useState<'public' | 'internal' | 'confidential' | 'restricted'>('internal')
  const [tags, setTags] = useState('')
  const [isSensitive, setIsSensitive] = useState(false)
  const [expirationDate, setExpirationDate] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    params.then(p => {
      setEntryId(p.id)
      fetchEntry(p.id)
    })
  }, [params])

  const fetchEntry = async (id: string) => {
    try {
      const response = await fetch(`/api/entries/${id}`)
      if (!response.ok) throw new Error('Failed to fetch entry')
      
      const data = await response.json()
      const entry = data.data

      setTitle(entry.title)
      setContent(entry.content)
      setCategory(entry.category)
      setClassification(entry.classification)
      setTags(entry.tags?.join(', ') || '')
      setIsSensitive(entry.is_sensitive)
      setExpirationDate(entry.expiration_date ? entry.expiration_date.split('T')[0] : '')
    } catch (error) {
      console.error('Error fetching entry:', error)
      setError('Failed to load entry')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!title || !content || !category) {
      setError('Title, content, and category are required')
      return
    }

    setIsSubmitting(true)

    try {
      // Parse tags (comma-separated)
      const tagArray = tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)

      const response = await fetch(`/api/entries/${entryId}`, {
        method: 'PUT',
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
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update entry')
      }

      // Redirect to entry detail page
      router.push(`/entries/${entryId}`)
    } catch (error: any) {
      console.error('Update error:', error)
      setError(error.message || 'Failed to update entry')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading entry...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href={`/entries/${entryId}`}
            className="text-slate-600 hover:text-slate-900 text-sm font-medium"
          >
            ← Back to Entry
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Edit Entry
          </h1>
          <p className="text-slate-600 mb-8">
            Update the knowledge entry details below
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="Enter entry title"
                required
              />
            </div>

            {/* Content */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-slate-700 mb-2">
                Content *
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={10}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-mono text-sm"
                placeholder="Enter entry content..."
                required
              />
            </div>

            {/* Category & Classification */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-2">
                  Category *
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                >
                  <option value="credential">Credential</option>
                  <option value="sop">SOP</option>
                  <option value="link">Link</option>
                  <option value="document">Document</option>
                </select>
              </div>

              <div>
                <label htmlFor="classification" className="block text-sm font-medium text-slate-700 mb-2">
                  Classification *
                </label>
                <select
                  id="classification"
                  value={classification}
                  onChange={(e) => setClassification(e.target.value as any)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                >
                  <option value="public">Public</option>
                  <option value="internal">Internal</option>
                  <option value="confidential">Confidential</option>
                  <option value="restricted">Restricted</option>
                </select>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-slate-700 mb-2">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="authentication, api, documentation"
              />
            </div>

            {/* Sensitive & Expiration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={isSensitive}
                    onChange={(e) => setIsSensitive(e.target.checked)}
                    className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-slate-300 rounded"
                  />
                  <span className="ml-2 text-sm font-medium text-slate-700">
                    Sensitive Content
                  </span>
                </label>
                <p className="mt-1 text-xs text-slate-500">
                  Mark if this entry contains sensitive information
                </p>
              </div>

              <div>
                <label htmlFor="expirationDate" className="block text-sm font-medium text-slate-700 mb-2">
                  Expiration Date (Optional)
                </label>
                <input
                  type="date"
                  id="expirationDate"
                  value={expirationDate}
                  onChange={(e) => setExpirationDate(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Updating...' : 'Update Entry'}
              </button>
              <Link
                href={`/entries/${entryId}`}
                className="px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-lg transition-colors duration-200 text-center"
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
