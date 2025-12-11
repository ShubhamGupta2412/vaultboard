'use client'

/**
 * Expiring Credentials Alert Component
 * 
 * Displays alerts for expired and expiring credentials on the dashboard
 */

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface ExpiringEntry {
  id: string
  title: string
  category: string
  expiration_date: string
  daysUntilExpiration: number
  status: 'expired' | 'critical' | 'warning' | 'notice'
}

interface ExpiringData {
  expired: ExpiringEntry[]
  critical: ExpiringEntry[]
  warning: ExpiringEntry[]
  counts: {
    expired: number
    critical: number
    warning: number
    notice: number
  }
}

export default function ExpiringCredentialsAlert() {
  const [data, setData] = useState<ExpiringData | null>(null)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    fetchExpiringCredentials()
  }, [])

  const fetchExpiringCredentials = async () => {
    try {
      const response = await fetch('/api/entries/expiring')
      if (!response.ok) throw new Error('Failed to fetch')
      const result = await response.json()
      setData(result.data)
    } catch (error) {
      console.error('Error fetching expiring credentials:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow p-4 animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-1/3 mb-2"></div>
        <div className="h-4 bg-slate-200 rounded w-2/3"></div>
      </div>
    )
  }

  if (!data || (data.counts.expired === 0 && data.counts.critical === 0 && data.counts.warning === 0)) {
    return null // No alerts to show
  }

  const totalAlerts = data.counts.expired + data.counts.critical + data.counts.warning

  return (
    <div className="bg-white rounded-xl shadow-lg border-l-4 border-orange-500 p-6 mb-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <svg className="h-8 w-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Credential Expiration Alerts</h3>
            <p className="text-sm text-slate-600">
              {totalAlerts} {totalAlerts === 1 ? 'credential needs' : 'credentials need'} your attention
            </p>
          </div>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-sm font-medium text-teal-600 hover:text-teal-700"
        >
          {expanded ? 'Hide' : 'View Details'}
        </button>
      </div>

      {/* Summary Badges */}
      <div className="flex flex-wrap gap-3 mb-4">
        {data.counts.expired > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
            <span className="inline-block w-2 h-2 bg-red-500 rounded-full"></span>
            <span className="text-sm font-semibold text-red-800">
              {data.counts.expired} Expired
            </span>
          </div>
        )}
        {data.counts.critical > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 bg-orange-50 border border-orange-200 rounded-lg">
            <span className="inline-block w-2 h-2 bg-orange-500 rounded-full"></span>
            <span className="text-sm font-semibold text-orange-800">
              {data.counts.critical} Expiring Soon (≤7 days)
            </span>
          </div>
        )}
        {data.counts.warning > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-lg">
            <span className="inline-block w-2 h-2 bg-yellow-500 rounded-full"></span>
            <span className="text-sm font-semibold text-yellow-800">
              {data.counts.warning} Expiring (≤14 days)
            </span>
          </div>
        )}
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="space-y-4 pt-4 border-t border-slate-200">
          {/* Expired Entries */}
          {data.expired.length > 0 && (
            <div>
              <h4 className="text-sm font-bold text-red-800 mb-2">⚠️ Expired Credentials</h4>
              <div className="space-y-2">
                {data.expired.map((entry) => (
                  <Link
                    key={entry.id}
                    href={`/entries/${entry.id}`}
                    className="block p-3 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">{entry.title}</p>
                        <p className="text-xs text-slate-600 capitalize">{entry.category}</p>
                      </div>
                      <span className="text-xs font-bold text-red-600">
                        {Math.abs(entry.daysUntilExpiration)} days overdue
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Critical Entries */}
          {data.critical.length > 0 && (
            <div>
              <h4 className="text-sm font-bold text-orange-800 mb-2">🔥 Expiring Soon (≤7 days)</h4>
              <div className="space-y-2">
                {data.critical.map((entry) => (
                  <Link
                    key={entry.id}
                    href={`/entries/${entry.id}`}
                    className="block p-3 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">{entry.title}</p>
                        <p className="text-xs text-slate-600 capitalize">{entry.category}</p>
                      </div>
                      <span className="text-xs font-bold text-orange-600">
                        {entry.daysUntilExpiration} days left
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Warning Entries */}
          {data.warning.length > 0 && (
            <div>
              <h4 className="text-sm font-bold text-yellow-800 mb-2">⚡ Expiring (≤14 days)</h4>
              <div className="space-y-2">
                {data.warning.map((entry) => (
                  <Link
                    key={entry.id}
                    href={`/entries/${entry.id}`}
                    className="block p-3 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">{entry.title}</p>
                        <p className="text-xs text-slate-600 capitalize">{entry.category}</p>
                      </div>
                      <span className="text-xs font-bold text-yellow-600">
                        {entry.daysUntilExpiration} days left
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
