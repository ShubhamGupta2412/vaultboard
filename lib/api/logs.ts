/**
 * Access Logging API Functions
 * 
 * Handles logging and retrieving access logs for audit trail
 */

import { createClient } from '@/lib/supabase/client'

/**
 * Access log action types
 */
export type AccessAction = 'view' | 'create' | 'update' | 'delete' | 'export'

/**
 * Access log interface
 */
export interface AccessLog {
  id: string
  entry_id: string
  accessed_by: string | null
  action: AccessAction
  accessed_at: string
  ip_address: string | null
  user_agent: string | null
}

/**
 * Access statistics interface
 */
export interface AccessStats {
  total_views: number
  total_updates: number
  total_exports: number
  last_accessed_at: string | null
  most_accessed_by: string | null
  unique_users: number
}

/**
 * Log an access event
 * 
 * @param entryId - Entry being accessed
 * @param userId - User performing the action
 * @param action - Type of action performed
 * @param ipAddress - Client IP address (optional)
 * @param userAgent - Client user agent (optional)
 */
export async function logAccess(
  entryId: string,
  userId: string,
  action: AccessAction = 'view',
  ipAddress?: string,
  userAgent?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient()

    const { error } = await supabase.from('access_logs').insert({
      entry_id: entryId,
      accessed_by: userId,
      action,
      ip_address: ipAddress || null,
      user_agent: userAgent || null,
    })

    if (error) {
      console.error('Error logging access:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Error in logAccess:', error)
    return { success: false, error: 'Failed to log access' }
  }
}

/**
 * Get all access logs for a specific entry
 * 
 * @param entryId - Entry ID to get logs for
 * @returns Array of access logs
 */
export async function getAccessLogs(entryId: string): Promise<AccessLog[]> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('access_logs')
      .select('*')
      .eq('entry_id', entryId)
      .order('accessed_at', { ascending: false })

    if (error) {
      console.error('Error fetching access logs:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in getAccessLogs:', error)
    return []
  }
}

/**
 * Get all access logs for a specific user
 * 
 * @param userId - User ID to get logs for
 * @returns Array of access logs
 */
export async function getAccessLogsByUser(userId: string): Promise<AccessLog[]> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('access_logs')
      .select('*')
      .eq('accessed_by', userId)
      .order('accessed_at', { ascending: false })

    if (error) {
      console.error('Error fetching user access logs:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in getAccessLogsByUser:', error)
    return []
  }
}

/**
 * Get access statistics for an entry
 * 
 * @param entryId - Entry ID to get statistics for
 * @returns Access statistics object
 */
export async function getAccessStats(entryId: string): Promise<AccessStats> {
  try {
    const supabase = createClient()

    // Get all logs for the entry
    const { data: logs, error } = await supabase
      .from('access_logs')
      .select('*')
      .eq('entry_id', entryId)

    if (error) {
      console.error('Error fetching access stats:', error)
      return {
        total_views: 0,
        total_updates: 0,
        total_exports: 0,
        last_accessed_at: null,
        most_accessed_by: null,
        unique_users: 0,
      }
    }

    if (!logs || logs.length === 0) {
      return {
        total_views: 0,
        total_updates: 0,
        total_exports: 0,
        last_accessed_at: null,
        most_accessed_by: null,
        unique_users: 0,
      }
    }

    // Calculate statistics
    const total_views = logs.filter(log => log.action === 'view').length
    const total_updates = logs.filter(log => log.action === 'update').length
    const total_exports = logs.filter(log => log.action === 'export').length
    const last_accessed_at = logs[0]?.accessed_at || null

    // Find most frequent user
    const userCounts: Record<string, number> = {}
    logs.forEach(log => {
      if (log.accessed_by) {
        userCounts[log.accessed_by] = (userCounts[log.accessed_by] || 0) + 1
      }
    })

    const most_accessed_by = Object.keys(userCounts).length > 0
      ? Object.entries(userCounts).sort((a, b) => b[1] - a[1])[0][0]
      : null

    const unique_users = new Set(logs.map(log => log.accessed_by).filter(Boolean)).size

    return {
      total_views,
      total_updates,
      total_exports,
      last_accessed_at,
      most_accessed_by,
      unique_users,
    }
  } catch (error) {
    console.error('Error in getAccessStats:', error)
    return {
      total_views: 0,
      total_updates: 0,
      total_exports: 0,
      last_accessed_at: null,
      most_accessed_by: null,
      unique_users: 0,
    }
  }
}

/**
 * Mask IP address for privacy (show only first octet)
 * Example: 192.168.1.1 -> 192.xxx.xxx.xxx
 * 
 * @param ipAddress - IP address to mask
 * @returns Masked IP address
 */
export function maskIPAddress(ipAddress: string | null): string {
  if (!ipAddress) return 'Unknown'
  
  const parts = ipAddress.split('.')
  if (parts.length === 4) {
    return `${parts[0]}.xxx.xxx.xxx`
  }
  
  // For IPv6 or other formats, show first segment only
  const segments = ipAddress.split(':')
  if (segments.length > 1) {
    return `${segments[0]}:xxxx:...`
  }
  
  return 'xxx.xxx.xxx.xxx'
}
