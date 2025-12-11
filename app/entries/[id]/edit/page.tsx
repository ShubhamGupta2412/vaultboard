'use client'

/**
 * Edit Entry Page
 * 
 * Form to update an existing knowledge entry
 */

import { useState, useEffect, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Logo from '@/components/Logo'

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
  const [file, setFile] = useState<File | null>(null)
  const [existingFileUrl, setExistingFileUrl] = useState<string | null>(null)
  const [existingFileName, setExistingFileName] = useState<string | null>(null)
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
      setExistingFileUrl(entry.file_url)
      setExistingFileName(entry.file_name)
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
      let fileUrl = existingFileUrl
      let fileName = existingFileName

      // Upload new file if provided (for document category)
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
          file_url: fileUrl,
          file_name: fileName,
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Logo size="sm" showText={false} />
              <h1 className="text-xl font-bold text-slate-900">Edit Entry</h1>
            </div>
            <Link
              href={`/entries/${entryId}`}
              className="text-slate-600 hover:text-slate-900 text-sm font-medium"
            >
              ← Back to Entry
            </Link>
          </div>
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

            {/* File Upload (for document category) */}
            {category === 'document' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Document Attachment
                </label>
                {existingFileUrl && existingFileName && !file && (
                  <div className="mb-3 p-3 bg-teal-50 border border-teal-200 rounded-lg">
                    <p className="text-sm text-slate-700">
                      Current file: <span className="font-semibold">{existingFileName}</span>
                    </p>
                    <a
                      href={existingFileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-teal-600 hover:text-teal-700 underline"
                    >
                      View current file
                    </a>
                  </div>
                )}
                <input
                  id="file"
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-slate-900 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                  disabled={isSubmitting}
                  accept=".pdf,.doc,.docx,.txt,.md,.xlsx,.xls,.csv,.zip"
                />
                <p className="mt-1 text-xs text-slate-500">
                  {file ? `New file selected: ${file.name}` : 'Upload a new file to replace the existing one (optional)'}
                </p>
              </div>
            )}

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
