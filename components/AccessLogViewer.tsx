'use client'

/**
 * Access Log Viewer Component
 * 
 * Displays access logs in a table with filtering and sorting
 */

import { useState, useEffect } from 'react'

type AccessAction = 'view' | 'create' | 'update' | 'delete' | 'export'

interface AccessLog {
  id: string
  action: AccessAction
  accessed_at: string
  ip_address: string | null
  user_agent: string | null
  user_email: string
}

interface AccessLogViewerProps {
  entryId: string
  userRole: string
}

export default function AccessLogViewer({ entryId, userRole }: AccessLogViewerProps) {
  const [logs, setLogs] = useState<AccessLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterAction, setFilterAction] = useState<AccessAction | 'all'>('all')
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    fetchLogs()
  }, [entryId])

  const fetchLogs = async () => {
    try {
      const response = await fetch(`/api/entries/${entryId}/access`)
      
      if (!response.ok) {
        if (response.status === 403) {
          setError('You do not have permission to view access logs')
        } else {
          setError('Failed to load access logs')
        }
        setLoading(false)
        return
      }

      const data = await response.json()
      setLogs(data.data.logs || [])
      setStats(data.data.stats || null)
    } catch (err) {
      console.error('Error fetching logs:', err)
      setError('Failed to load access logs')
    } finally {
      setLoading(false)
    }
  }

  const maskIPAddress = (ip: string | null): string => {
    if (!ip) return 'Unknown'
    const parts = ip.split('.')
    if (parts.length === 4) {
      return `${parts[0]}.xxx.xxx.xxx`
    }
    return 'xxx.xxx.xxx.xxx'
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getActionBadge = (action: AccessAction) => {
    const colors = {
      view: 'bg-blue-100 text-blue-700',
      create: 'bg-green-100 text-green-700',
      update: 'bg-yellow-100 text-yellow-700',
      delete: 'bg-red-100 text-red-700',
      export: 'bg-purple-100 text-purple-700',
    }

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded ${colors[action]}`}>
        {action.toUpperCase()}
      </span>
    )
  }

  const filteredLogs = filterAction === 'all' 
    ? logs 
    : logs.filter(log => log.action === filterAction)

  // Only show to admin/manager
  if (!['admin', 'manager'].includes(userRole)) {
    return null
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-slate-200 rounded w-1/4"></div>
          <div className="h-32 bg-slate-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow p-6">
        <div className="text-center text-slate-600">
          <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="mt-2 text-sm">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow">
      {/* Header with Stats */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">
            Access History
          </h3>
          {stats && (
            <div className="flex items-center gap-4 text-sm text-slate-600">
              <span>Total: <strong>{stats.total_accesses}</strong></span>
              <span>Views: <strong>{stats.total_views}</strong></span>
              <span>Updates: <strong>{stats.total_updates}</strong></span>
              <span>Users: <strong>{stats.unique_users}</strong></span>
            </div>
          )}
        </div>

        {/* Filter */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilterAction('all')}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              filterAction === 'all'
                ? 'bg-teal-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All
          </button>
          {['view', 'create', 'update', 'delete', 'export'].map(action => (
            <button
              key={action}
              onClick={() => setFilterAction(action as AccessAction)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors capitalize ${
                filterAction === action
                  ? 'bg-teal-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {action}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="mt-2">No access logs found</p>
            <p className="text-sm text-slate-400">Access history will appear here</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  IP Address
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {log.user_email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getActionBadge(log.action)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {formatDate(log.accessed_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-mono">
                    {maskIPAddress(log.ip_address)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
