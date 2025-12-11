/**
 * API Route: /api/entries
 * 
 * Handles fetching all entries (GET) and creating new entries (POST)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserRole } from '@/lib/api/auth-server'

export async function GET(request: NextRequest) {
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

    // Get user role
    const userRole = await getUserRole(user.id)
    if (!userRole) {
      return NextResponse.json(
        { error: 'User role not found' },
        { status: 403 }
      )
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const category = searchParams.get('category')
    const classification = searchParams.get('classification')
    const search = searchParams.get('search')

    // Build query
    let query = supabase
      .from('knowledge_entries')
      .select('*', { count: 'exact' })

    // Apply search if provided
    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`)
    }

    // Apply filters
    if (category) {
      query = query.eq('category', category)
    }
    if (classification) {
      query = query.eq('classification', classification)
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' })

    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching entries:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    // Mask sensitive content
    const maskedData = (data || []).map(entry => {
      if (entry.is_sensitive && entry.content) {
        const content = entry.content
        if (content.length <= 8) {
          return { ...entry, content: '****' }
        }
        const first4 = content.substring(0, 4)
        const last4 = content.substring(content.length - 4)
        const masked = '*'.repeat(Math.min(content.length - 8, 20))
        return { ...entry, content: `${first4}${masked}${last4}` }
      }
      return entry
    })

    return NextResponse.json({
      success: true,
      data: maskedData,
      count: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    })
  } catch (error) {
    console.error('GET /api/entries error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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

    // Parse request body
    const body = await request.json()
    const {
      title,
      content,
      category,
      classification = 'internal',
      tags = [],
      is_sensitive = false,
      expiration_date = null
    } = body

    // Validate required fields
    if (!title || !content || !category) {
      return NextResponse.json(
        { error: 'Title, content, and category are required' },
        { status: 400 }
      )
    }

    // Validate category
    const validCategories = ['credential', 'sop', 'link', 'document']
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: 'Invalid category' },
        { status: 400 }
      )
    }

    // Validate classification
    const validClassifications = ['public', 'internal', 'confidential', 'restricted']
    if (!validClassifications.includes(classification)) {
      return NextResponse.json(
        { error: 'Invalid classification' },
        { status: 400 }
      )
    }

    // Create entry
    const { data, error } = await supabase
      .from('knowledge_entries')
      .insert({
        user_id: user.id,
        title,
        content,
        category,
        classification,
        tags,
        is_sensitive,
        expiration_date,
        created_by: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating entry:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Entry created successfully',
      data
    }, { status: 201 })
  } catch (error) {
    console.error('POST /api/entries error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
