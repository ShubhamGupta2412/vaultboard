/**
 * API Route: /api/entries/[id]/export
 * 
 * Export entry as JSON or text
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserRole } from '@/lib/api/auth-server'
import { conditionalDecrypt } from '@/lib/utils/encryption'

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
    const searchParams = request.nextUrl.searchParams
    const format = searchParams.get('format') || 'json' // json or txt

    // Fetch entry
    const { data: entry, error } = await supabase
      .from('knowledge_entries')
      .select('*')
      .eq('id', entryId)
      .single()

    if (error || !entry) {
      return NextResponse.json(
        { error: 'Entry not found' },
        { status: 404 }
      )
    }

    // Check if user can view this entry
    const userRole = await getUserRole(user.id)
    
    // Decrypt content if sensitive
    const decryptedContent = entry.is_sensitive 
      ? conditionalDecrypt(entry.content, entry.is_sensitive)
      : entry.content
    
    // Log the export action
    await supabase.from('access_logs').insert({
      entry_id: entryId,
      accessed_by: user.id,
      action: 'export',
      accessed_at: new Date().toISOString(),
    })

    // Export as JSON
    if (format === 'json') {
      const exportData = {
        title: entry.title,
        content: decryptedContent,
        category: entry.category,
        classification: entry.classification,
        tags: entry.tags,
        created_at: entry.created_at,
        updated_at: entry.updated_at,
        exported_at: new Date().toISOString(),
        exported_by: user.email,
      }

      return new NextResponse(JSON.stringify(exportData, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${entry.title.replace(/[^a-z0-9]/gi, '_')}_${entryId.substring(0, 8)}.json"`,
        },
      })
    }

    // Export as text
    if (format === 'txt') {
      const textContent = `
VAULTBOARD ENTRY EXPORT
=======================

Title: ${entry.title}
Category: ${entry.category}
Classification: ${entry.classification}
Tags: ${entry.tags?.join(', ') || 'None'}

Created: ${new Date(entry.created_at).toLocaleString()}
Updated: ${new Date(entry.updated_at).toLocaleString()}
Exported: ${new Date().toLocaleString()}
Exported By: ${user.email}

---

CONTENT:

${decryptedContent}

---

© VaultBoard - Internal Knowledge Management System
`.trim()

      return new NextResponse(textContent, {
        headers: {
          'Content-Type': 'text/plain',
          'Content-Disposition': `attachment; filename="${entry.title.replace(/[^a-z0-9]/gi, '_')}_${entryId.substring(0, 8)}.txt"`,
        },
      })
    }

    return NextResponse.json(
      { error: 'Invalid format. Use json or txt' },
      { status: 400 }
    )
  } catch (error) {
    console.error('GET /api/entries/[id]/export error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
