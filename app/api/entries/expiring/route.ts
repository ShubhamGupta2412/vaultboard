/**
 * API Route: Check Expiring Credentials
 * GET /api/entries/expiring
 * 
 * Returns entries that are expired or expiring soon
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { conditionalDecrypt } from '@/lib/utils/encryption'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get query params for days threshold (default: 30 days)
    const { searchParams } = new URL(request.url)
    const daysThreshold = parseInt(searchParams.get('days') || '30')

    const now = new Date()
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + daysThreshold)

    // Query entries with expiration dates
    const { data: entries, error } = await supabase
      .from('knowledge_entries')
      .select('*')
      .not('expiration_date', 'is', null)
      .lte('expiration_date', futureDate.toISOString())
      .order('expiration_date', { ascending: true })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch expiring entries' },
        { status: 500 }
      )
    }

    // Decrypt sensitive content and categorize by status
    const processedEntries = entries.map(entry => {
      const expirationDate = new Date(entry.expiration_date)
      const daysUntilExpiration = Math.ceil(
        (expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      )

      let status: 'expired' | 'critical' | 'warning' | 'notice'
      if (daysUntilExpiration < 0) {
        status = 'expired'
      } else if (daysUntilExpiration <= 7) {
        status = 'critical'
      } else if (daysUntilExpiration <= 14) {
        status = 'warning'
      } else {
        status = 'notice'
      }

      return {
        ...entry,
        content: conditionalDecrypt(entry.content, entry.is_sensitive),
        daysUntilExpiration,
        status,
      }
    })

    // Separate into categories
    const expired = processedEntries.filter(e => e.status === 'expired')
    const critical = processedEntries.filter(e => e.status === 'critical')
    const warning = processedEntries.filter(e => e.status === 'warning')
    const notice = processedEntries.filter(e => e.status === 'notice')

    return NextResponse.json({
      success: true,
      data: {
        all: processedEntries,
        expired,
        critical,
        warning,
        notice,
        counts: {
          total: processedEntries.length,
          expired: expired.length,
          critical: critical.length,
          warning: warning.length,
          notice: notice.length,
        },
      },
    })
  } catch (error) {
    console.error('Error checking expiring entries:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
