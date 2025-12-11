'use client'

/**
 * Security Badge Component
 * 
 * Small badge showing classification with lock icon for sensitive entries
 */

type Classification = 'public' | 'internal' | 'confidential' | 'restricted'

interface SecurityBadgeProps {
  classification: Classification
  sensitive?: boolean
  compact?: boolean
}

export default function SecurityBadge({ 
  classification, 
  sensitive = false,
  compact = false 
}: SecurityBadgeProps) {
  
  const colors = {
    public: 'bg-green-100 text-green-800 border-green-200',
    internal: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    confidential: 'bg-orange-100 text-orange-800 border-orange-200',
    restricted: 'bg-red-100 text-red-800 border-red-200',
  }

  const lockIcons = {
    public: null,
    internal: null,
    confidential: '🔒',
    restricted: '🔒🔒',
  }

  if (compact) {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded border ${colors[classification]}`}>
        {lockIcons[classification] && <span>{lockIcons[classification]}</span>}
        <span className="capitalize">{classification}</span>
      </span>
    )
  }

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 text-sm font-medium rounded-lg border ${colors[classification]}`}>
      {lockIcons[classification] && (
        <span className="text-base">{lockIcons[classification]}</span>
      )}
      <span className="capitalize">{classification}</span>
      {sensitive && (
        <span className="ml-1 text-xs" title="Sensitive Content">⚠️</span>
      )}
    </div>
  )
}
