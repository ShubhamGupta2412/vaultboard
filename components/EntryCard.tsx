'use client'

/**
 * EntryCard Component
 * 
 * Displays a knowledge entry in card format with category badges and actions
 */

import Link from 'next/link'
import { KnowledgeEntry } from '@/lib/api/entries'
import SecurityBadge from './SecurityBadge'

interface EntryCardProps {
  entry: KnowledgeEntry
  onDelete?: (id: string) => void
  currentUserId?: string
  userRole?: string
}

export default function EntryCard({ 
  entry, 
  onDelete, 
  currentUserId,
  userRole 
}: EntryCardProps) {
  
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

  // Check if user can edit/delete (creator or admin)
  const canModify = currentUserId === entry.user_id || userRole === 'admin'

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  // Check expiration status
  const getExpirationStatus = () => {
    if (!entry.expiration_date) return null
    
    const now = new Date()
    const expirationDate = new Date(entry.expiration_date)
    const daysUntilExpiration = Math.ceil(
      (expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (daysUntilExpiration < 0) {
      return { status: 'expired', label: 'EXPIRED', color: 'bg-red-100 text-red-800 border-red-200' }
    } else if (daysUntilExpiration <= 7) {
      return { status: 'critical', label: `Expires in ${daysUntilExpiration}d`, color: 'bg-orange-100 text-orange-800 border-orange-200' }
    } else if (daysUntilExpiration <= 14) {
      return { status: 'warning', label: `Expires in ${daysUntilExpiration}d`, color: 'bg-yellow-100 text-yellow-800 border-yellow-200' }
    }
    return null
  }

  const expirationStatus = getExpirationStatus()

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6 border border-slate-200">
      {/* Header with Badges */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex gap-2 flex-wrap items-center">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${categoryColors[entry.category]}`}>
            {entry.category}
          </span>
          <SecurityBadge 
            classification={entry.classification}
            sensitive={entry.is_sensitive}
            compact
          />
          {expirationStatus && (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${expirationStatus.color}`}>
              {expirationStatus.label}
            </span>
          )}
        </div>
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-slate-900 mb-2 line-clamp-2">
        {entry.title}
      </h3>

      {/* Content Preview */}
      <p className="text-sm text-slate-600 mb-4 line-clamp-3">
        {entry.content}
      </p>

      {/* Tags */}
      {entry.tags && entry.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {entry.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700"
            >
              #{tag}
            </span>
          ))}
          {entry.tags.length > 3 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
              +{entry.tags.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Metadata */}
      <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
        <div className="flex flex-col gap-1">
          <span>Created: {formatDate(entry.created_at)}</span>
          {entry.last_accessed_at && (
            <span>Last accessed: {formatDate(entry.last_accessed_at)}</span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Link
          href={`/entries/${entry.id}`}
          className="flex-1 text-center px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
        >
          View
        </Link>
        {canModify && (
          <>
            <Link
              href={`/entries/${entry.id}/edit`}
              className="flex-1 text-center px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors duration-200"
            >
              Edit
            </Link>
            <button
              onClick={() => onDelete && onDelete(entry.id)}
              className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium rounded-lg transition-colors duration-200"
            >
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  )
}
