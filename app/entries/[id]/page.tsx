/**
 * View Single Entry Page
 * 
 * Display entry details with edit/delete actions and access history
 */

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getUserRole } from '@/lib/api/auth-server'
import Link from 'next/link'
import DeleteButton from '@/components/DeleteButton'
import CopyButton from '@/components/CopyButton'
import AccessIndicator from '@/components/AccessIndicator'
import SecurityBadge from '@/components/SecurityBadge'
import AccessLogViewer from '@/components/AccessLogViewer'
import ExportButton from '@/components/ExportButton'
import Logo from '@/components/Logo'

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

  // Log the access
  await supabase.from('access_logs').insert({
    entry_id: id,
    accessed_by: user.id,
    action: 'view',
    accessed_at: new Date().toISOString(),
  })

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
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="text-slate-600 hover:text-slate-900 text-sm font-medium flex items-center gap-1"
              >
                ← Back
              </Link>
              <div className="h-6 w-px bg-slate-300 mx-2"></div>
              <Logo size="sm" showText={true} />
            </div>
            <div className="flex gap-2">
              <ExportButton entryId={id} entryTitle={entry.title} />
              {canModify && (
                <>
                  <Link
                    href={`/entries/${id}/edit`}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Edit
                  </Link>
                  <DeleteButton entryId={id} />
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        {/* Entry Details Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Security Indicators */}
          <div className="flex items-center gap-3 mb-4">
            <AccessIndicator 
              classification={entry.classification as any}
              sensitive={entry.is_sensitive}
              size="md"
            />
            <SecurityBadge 
              classification={entry.classification as any}
              sensitive={entry.is_sensitive}
            />
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-slate-900 mb-6">
            {entry.title}
          </h1>

          {/* Category Badge */}
          <div className="mb-6">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize ${categoryColors[entry.category as keyof typeof categoryColors]}`}>
              {entry.category}
            </span>
          </div>

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

        {/* Access Log Viewer */}
        <AccessLogViewer entryId={id} userRole={userRole || 'viewer'} />
      </main>
    </div>
  )
}
