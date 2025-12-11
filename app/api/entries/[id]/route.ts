/**
 * API Route: /api/entries/[id]
 * 
 * Handles fetching single entry (GET), updating (PUT), and deleting (DELETE)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserRole } from '@/lib/api/auth-server'
import { conditionalEncrypt, conditionalDecrypt } from '@/lib/utils/encryption'

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

    // Fetch entry
    const { data, error } = await supabase
      .from('knowledge_entries')
      .select('*')
      .eq('id', entryId)
      .single()

    if (error) {
      console.error('Error fetching entry:', error)
      return NextResponse.json(
        { error: error.message },
        { status: error.code === 'PGRST116' ? 404 : 500 }
      )
    }

    // Update last_accessed_at
    await supabase
      .from('knowledge_entries')
      .update({ last_accessed_at: new Date().toISOString() })
      .eq('id', entryId)

    // Decrypt content if sensitive
    if (data.is_sensitive && data.content) {
      data.content = conditionalDecrypt(data.content, data.is_sensitive)
    }

    return NextResponse.json({
      success: true,
      data
    })
  } catch (error) {
    console.error('GET /api/entries/[id] error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
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

    // Parse request body
    const body = await request.json()
    
    // Encrypt content if it's being updated and entry is sensitive
    if (body.content && body.is_sensitive) {
      body.content = conditionalEncrypt(body.content, body.is_sensitive)
    }
    
    const updates = {
      ...body,
      updated_at: new Date().toISOString()
    }

    // Remove fields that shouldn't be updated
    delete updates.id
    delete updates.user_id
    delete updates.created_at
    delete updates.created_by

    // Update entry
    const { data, error } = await supabase
      .from('knowledge_entries')
      .update(updates)
      .eq('id', entryId)
      .select()
      .single()

    if (error) {
      console.error('Error updating entry:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    // Log the update action
    await supabase.from('access_logs').insert({
      entry_id: entryId,
      accessed_by: user.id,
      action: 'update',
      accessed_at: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      message: 'Entry updated successfully',
      data
    })
  } catch (error) {
    console.error('PUT /api/entries/[id] error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    // Get user role for permission check
    const userRole = await getUserRole(user.id)

    // Check if entry exists and get owner
    const { data: entry, error: fetchError } = await supabase
      .from('knowledge_entries')
      .select('user_id')
      .eq('id', entryId)
      .single()

    if (fetchError) {
      return NextResponse.json(
        { error: 'Entry not found' },
        { status: 404 }
      )
    }

    // Check permissions: only creator or admin can delete
    if (entry.user_id !== user.id && userRole !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: You can only delete your own entries' },
        { status: 403 }
      )
    }

    // Log the delete action before deleting
    await supabase.from('access_logs').insert({
      entry_id: entryId,
      accessed_by: user.id,
      action: 'delete',
      accessed_at: new Date().toISOString(),
    })

    // Delete entry
    const { error } = await supabase
      .from('knowledge_entries')
      .delete()
      .eq('id', entryId)

    if (error) {
      console.error('Error deleting entry:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Entry deleted successfully'
    })
  } catch (error) {
    console.error('DELETE /api/entries/[id] error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
