/**
 * Vercel Cron Job: Check Expiring Credentials Daily
 * 
 * This endpoint is called by Vercel Cron (9 AM UTC daily)
 * Logs expiring credentials for notification purposes
 * 
 * Note: To enable email notifications, integrate with a service like:
 * - Resend, SendGrid, Mailgun, or AWS SES
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { conditionalDecrypt } from '@/lib/utils/encryption'

export async function GET(request: NextRequest) {
  try {
    // Verify Vercel Cron Secret (recommended for production)
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = await createClient()

    const now = new Date()
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 14) // Check 14 days ahead

    // Query entries with expiration dates
    const { data: entries, error } = await supabase
      .from('knowledge_entries')
      .select('id, title, category, expiration_date, user_id')
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

    // Categorize entries
    const expired: any[] = []
    const critical: any[] = []
    const warning: any[] = []

    entries.forEach(entry => {
      const expirationDate = new Date(entry.expiration_date!)
      const daysUntilExpiration = Math.ceil(
        (expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      )

      if (daysUntilExpiration < 0) {
        expired.push({ ...entry, daysUntilExpiration })
      } else if (daysUntilExpiration <= 7) {
        critical.push({ ...entry, daysUntilExpiration })
      } else if (daysUntilExpiration <= 14) {
        warning.push({ ...entry, daysUntilExpiration })
      }
    })

    // Log results (for Vercel logs)
    console.log('=== Daily Credential Expiration Check ===')
    console.log(`Expired: ${expired.length}`)
    console.log(`Critical (≤7 days): ${critical.length}`)
    console.log(`Warning (≤14 days): ${warning.length}`)

    if (expired.length > 0) {
      console.log('Expired entries:', expired.map(e => `${e.title} (${e.category})`))
    }
    if (critical.length > 0) {
      console.log('Critical entries:', critical.map(e => `${e.title} (${e.daysUntilExpiration}d)`))
    }

    // TODO: Send email notifications
    // Example: Use Resend, SendGrid, or other email service
    // await sendExpirationNotifications(expired, critical, warning)

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      summary: {
        expired: expired.length,
        critical: critical.length,
        warning: warning.length,
        total: entries.length,
      },
      message: 'Expiration check completed. Check logs for details.',
    })
  } catch (error) {
    console.error('Cron job error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
