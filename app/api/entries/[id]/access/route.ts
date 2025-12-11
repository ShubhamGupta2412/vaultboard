/**
 * API Route: /api/entries/[id]/access
 * 
 * Get access logs for a specific entry (admin/manager only)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserRole } from '@/lib/api/auth-server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id: entryId } = await params

    // Check if user is admin or manager
    const userRole = await getUserRole(user.id)
    if (!userRole || !['admin', 'manager'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Forbidden: Only admins and managers can view access logs' },
        { status: 403 }
      )
    }

    // Verify entry exists
    const { data: entry, error: entryError } = await supabase
      .from('knowledge_entries')
      .select('id')
      .eq('id', entryId)
      .single()

    if (entryError || !entry) {
      return NextResponse.json(
        { error: 'Entry not found' },
        { status: 404 }
      )
    }

    // Fetch access logs with user information
    const { data: logs, error: logsError } = await supabase
      .from('access_logs')
      .select(`
        id,
        action,
        accessed_at,
        ip_address,
        user_agent,
        accessed_by
      `)
      .eq('entry_id', entryId)
      .order('accessed_at', { ascending: false })

    if (logsError) {
      console.error('Error fetching access logs:', logsError)
      return NextResponse.json(
        { error: logsError.message },
        { status: 500 }
      )
    }

    // Get user emails for accessed_by IDs
    const userIds = logs?.map(log => log.accessed_by).filter(Boolean) || []
    const uniqueUserIds = [...new Set(userIds)]

    let userEmails: Record<string, string> = {}
    if (uniqueUserIds.length > 0) {
      const { data: users } = await supabase.auth.admin.listUsers()
      users?.users.forEach(u => {
        if (uniqueUserIds.includes(u.id)) {
          userEmails[u.id] = u.email || 'Unknown'
        }
      })
    }

    // Enhance logs with user emails
    const enhancedLogs = logs?.map(log => ({
      ...log,
      user_email: log.accessed_by ? userEmails[log.accessed_by] || 'Unknown User' : 'System',
    })) || []

    // Get access statistics
    const stats = {
      total_accesses: logs?.length || 0,
      total_views: logs?.filter(log => log.action === 'view').length || 0,
      total_updates: logs?.filter(log => log.action === 'update').length || 0,
      total_deletes: logs?.filter(log => log.action === 'delete').length || 0,
      total_exports: logs?.filter(log => log.action === 'export').length || 0,
      unique_users: new Set(userIds).size,
      last_accessed_at: logs?.[0]?.accessed_at || null,
    }

    return NextResponse.json({
      success: true,
      data: {
        logs: enhancedLogs,
        stats,
      }
    })
  } catch (error) {
    console.error('GET /api/entries/[id]/access error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
