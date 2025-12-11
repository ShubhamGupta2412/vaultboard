/**
 * View Single Entry Page
 * 
 * Display entry details with edit/delete actions
 */

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getUserRole } from '@/lib/api/auth-server'
import Link from 'next/link'
import DeleteButton from '@/components/DeleteButton'
import CopyButton from '@/components/CopyButton'

export default async function EntryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/login')
  }

  const userRole = await getUserRole(user.id)
  const { id } = await params

  // Fetch entry
  const { data: entry, error } = await supabase
    .from('knowledge_entries')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !entry) {
    redirect('/dashboard')
  }

  // Update last accessed timestamp
  await supabase
    .from('knowledge_entries')
    .update({ last_accessed_at: new Date().toISOString() })
    .eq('id', id)

  // Check if user can modify (creator or admin)
  const canModify = user.id === entry.user_id || userRole === 'admin'

  // Category badge colors
  const categoryColors = {
    credential: 'bg-blue-100 text-blue-800',
    sop: 'bg-purple-100 text-purple-800',
    link: 'bg-orange-100 text-orange-800',
    document: 'bg-green-100 text-green-800',
  }

  // Classification badge colors
  const classificationColors = {
    public: 'bg-green-100 text-green-800',
    internal: 'bg-yellow-100 text-yellow-800',
    confidential: 'bg-orange-100 text-orange-800',
    restricted: 'bg-red-100 text-red-800',
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/dashboard"
              className="text-slate-600 hover:text-slate-900 text-sm font-medium"
            >
              ← Back to Dashboard
            </Link>
            {canModify && (
              <div className="flex gap-2">
                <Link
                  href={`/entries/${id}/edit`}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Edit
                </Link>
                <DeleteButton entryId={id} />
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Badges */}
          <div className="flex items-center gap-2 mb-4">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${categoryColors[entry.category as keyof typeof categoryColors]}`}>
              {entry.category}
            </span>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${classificationColors[entry.classification as keyof typeof classificationColors]}`}>
              {entry.classification}
            </span>
            {entry.is_sensitive && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                Sensitive
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-slate-900 mb-6">
            {entry.title}
          </h1>

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-slate-50 rounded-lg">
            <div>
              <p className="text-xs text-slate-500 mb-1">Created</p>
              <p className="text-sm text-slate-900 font-medium">{formatDate(entry.created_at)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Last Updated</p>
              <p className="text-sm text-slate-900 font-medium">{formatDate(entry.updated_at)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Last Accessed</p>
              <p className="text-sm text-slate-900 font-medium">{formatDate(entry.last_accessed_at)}</p>
            </div>
            {entry.expiration_date && (
              <div>
                <p className="text-xs text-slate-500 mb-1">Expires</p>
                <p className="text-sm text-slate-900 font-medium">{formatDate(entry.expiration_date)}</p>
              </div>
            )}
          </div>

          {/* Tags */}
          {entry.tags && entry.tags.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-slate-700 mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {entry.tags.map((tag: string, index: number) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-slate-100 text-slate-700"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Content */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-slate-700">Content</h3>
              <CopyButton content={entry.content} />
            </div>
            <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
              <pre className="whitespace-pre-wrap text-sm text-slate-900 font-mono">
                {entry.content}
              </pre>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
