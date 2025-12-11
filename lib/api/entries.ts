/**
 * Knowledge Entries API Functions
 * 
 * This file contains all CRUD operations for knowledge entries with role-based access control.
 */

import { createClient } from '@/lib/supabase/client'

/**
 * Entry category types
 */
export type EntryCategory = 'credential' | 'sop' | 'link' | 'document'

/**
 * Entry classification types (security levels)
 */
export type EntryClassification = 'public' | 'internal' | 'confidential' | 'restricted'

/**
 * User role types
 */
export type UserRole = 'admin' | 'manager' | 'member' | 'viewer'

/**
 * Knowledge entry interface
 */
export interface KnowledgeEntry {
  id: string
  user_id: string
  title: string
  content: string
  category: EntryCategory
  classification: EntryClassification
  tags: string[]
  is_sensitive: boolean
  expiration_date: string | null
  created_at: string
  updated_at: string
  last_accessed_at: string | null
  created_by: string | null
}

/**
 * Response type for entry operations
 */
export interface EntryResponse {
  success: boolean
  message: string
  data?: KnowledgeEntry | KnowledgeEntry[]
  error?: string
  count?: number
}

/**
 * Filter options for searching entries
 */
export interface EntryFilters {
  category?: EntryCategory
  classification?: EntryClassification
  tags?: string[]
  sortBy?: 'created_at' | 'updated_at' | 'last_accessed_at' | 'title'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

/**
 * Mask sensitive content - show first 4 and last 4 characters
 */
export function maskSensitiveContent(content: string): string {
  if (content.length <= 8) {
    return '****'
  }
  const first4 = content.substring(0, 4)
  const last4 = content.substring(content.length - 4)
  const masked = '*'.repeat(Math.min(content.length - 8, 20))
  return `${first4}${masked}${last4}`
}

/**
 * Create a new knowledge entry
 */
export async function createEntry(
  title: string,
  content: string,
  category: EntryCategory,
  classification: EntryClassification = 'internal',
  tags: string[] = [],
  isSensitive: boolean = false,
  expirationDate: string | null = null
): Promise<EntryResponse> {
  try {
    const supabase = createClient()

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return {
        success: false,
        message: 'User not authenticated',
        error: 'AUTH_ERROR'
      }
    }

    // Validate inputs
    if (!title || !content || !category) {
      return {
        success: false,
        message: 'Title, content, and category are required',
        error: 'VALIDATION_ERROR'
      }
    }

    // Insert entry
    const { data, error } = await supabase
      .from('knowledge_entries')
      .insert({
        user_id: user.id,
        title,
        content,
        category,
        classification,
        tags,
        is_sensitive: isSensitive,
        expiration_date: expirationDate,
        created_by: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating entry:', error)
      return {
        success: false,
        message: error.message,
        error: error.code
      }
    }

    return {
      success: true,
      message: 'Entry created successfully',
      data: data as KnowledgeEntry
    }
  } catch (error) {
    console.error('Create entry error:', error)
    return {
      success: false,
      message: 'An unexpected error occurred',
      error: 'UNKNOWN_ERROR'
    }
  }
}

/**
 * Get all entries with pagination and filtering
 */
export async function getAllEntries(
  filters: EntryFilters = {}
): Promise<EntryResponse> {
  try {
    const supabase = createClient()

    const {
      category,
      classification,
      tags,
      sortBy = 'created_at',
      sortOrder = 'desc',
      page = 1,
      limit = 10
    } = filters

    // Build query
    let query = supabase
      .from('knowledge_entries')
      .select('*', { count: 'exact' })

    // Apply filters
    if (category) {
      query = query.eq('category', category)
    }
    if (classification) {
      query = query.eq('classification', classification)
    }
    if (tags && tags.length > 0) {
      query = query.contains('tags', tags)
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
      return {
        success: false,
        message: error.message,
        error: error.code
      }
    }

    // Mask sensitive content in list view
    const maskedData = (data || []).map(entry => {
      if (entry.is_sensitive) {
        return {
          ...entry,
          content: maskSensitiveContent(entry.content)
        }
      }
      return entry
    })

    return {
      success: true,
      message: 'Entries fetched successfully',
      data: maskedData as KnowledgeEntry[],
      count: count || 0
    }
  } catch (error) {
    console.error('Get all entries error:', error)
    return {
      success: false,
      message: 'An unexpected error occurred',
      error: 'UNKNOWN_ERROR'
    }
  }
}

/**
 * Get a single entry by ID and track access
 */
export async function getEntryById(entryId: string): Promise<EntryResponse> {
  try {
    const supabase = createClient()

    // Fetch entry
    const { data, error } = await supabase
      .from('knowledge_entries')
      .select('*')
      .eq('id', entryId)
      .single()

    if (error) {
      console.error('Error fetching entry:', error)
      return {
        success: false,
        message: error.message,
        error: error.code
      }
    }

    // Update last_accessed_at
    await supabase
      .from('knowledge_entries')
      .update({ last_accessed_at: new Date().toISOString() })
      .eq('id', entryId)

    return {
      success: true,
      message: 'Entry fetched successfully',
      data: data as KnowledgeEntry
    }
  } catch (error) {
    console.error('Get entry by ID error:', error)
    return {
      success: false,
      message: 'An unexpected error occurred',
      error: 'UNKNOWN_ERROR'
    }
  }
}

/**
 * Update an entry
 */
export async function updateEntry(
  entryId: string,
  updates: Partial<Omit<KnowledgeEntry, 'id' | 'user_id' | 'created_at' | 'created_by'>>
): Promise<EntryResponse> {
  try {
    const supabase = createClient()

    // Add updated_at timestamp
    const updateData = {
      ...updates,
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('knowledge_entries')
      .update(updateData)
      .eq('id', entryId)
      .select()
      .single()

    if (error) {
      console.error('Error updating entry:', error)
      return {
        success: false,
        message: error.message,
        error: error.code
      }
    }

    return {
      success: true,
      message: 'Entry updated successfully',
      data: data as KnowledgeEntry
    }
  } catch (error) {
    console.error('Update entry error:', error)
    return {
      success: false,
      message: 'An unexpected error occurred',
      error: 'UNKNOWN_ERROR'
    }
  }
}

/**
 * Delete an entry
 */
export async function deleteEntry(entryId: string): Promise<EntryResponse> {
  try {
    const supabase = createClient()

    const { error } = await supabase
      .from('knowledge_entries')
      .delete()
      .eq('id', entryId)

    if (error) {
      console.error('Error deleting entry:', error)
      return {
        success: false,
        message: error.message,
        error: error.code
      }
    }

    return {
      success: true,
      message: 'Entry deleted successfully'
    }
  } catch (error) {
    console.error('Delete entry error:', error)
    return {
      success: false,
      message: 'An unexpected error occurred',
      error: 'UNKNOWN_ERROR'
    }
  }
}

/**
 * Search entries with full-text search
 */
export async function searchEntries(
  query: string,
  filters: EntryFilters = {}
): Promise<EntryResponse> {
  try {
    const supabase = createClient()

    const {
      category,
      classification,
      sortBy = 'created_at',
      sortOrder = 'desc',
      page = 1,
      limit = 10
    } = filters

    // Build search query
    let searchQuery = supabase
      .from('knowledge_entries')
      .select('*', { count: 'exact' })

    // Full-text search on title and content
    if (query) {
      searchQuery = searchQuery.or(`title.ilike.%${query}%,content.ilike.%${query}%`)
    }

    // Apply filters
    if (category) {
      searchQuery = searchQuery.eq('category', category)
    }
    if (classification) {
      searchQuery = searchQuery.eq('classification', classification)
    }

    // Apply sorting
    searchQuery = searchQuery.order(sortBy, { ascending: sortOrder === 'asc' })

    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    searchQuery = searchQuery.range(from, to)

    const { data, error, count } = await searchQuery

    if (error) {
      console.error('Error searching entries:', error)
      return {
        success: false,
        message: error.message,
        error: error.code
      }
    }

    // Mask sensitive content in search results
    const maskedData = (data || []).map(entry => {
      if (entry.is_sensitive) {
        return {
          ...entry,
          content: maskSensitiveContent(entry.content)
        }
      }
      return entry
    })

    return {
      success: true,
      message: 'Search completed successfully',
      data: maskedData as KnowledgeEntry[],
      count: count || 0
    }
  } catch (error) {
    console.error('Search entries error:', error)
    return {
      success: false,
      message: 'An unexpected error occurred',
      error: 'UNKNOWN_ERROR'
    }
  }
}

/**
 * Get entries by category
 */
export async function getEntriesByCategory(
  category: EntryCategory,
  page: number = 1,
  limit: number = 10
): Promise<EntryResponse> {
  return getAllEntries({ category, page, limit })
}

/**
 * Get entries by tag
 */
export async function getEntriesByTag(
  tag: string,
  page: number = 1,
  limit: number = 10
): Promise<EntryResponse> {
  return getAllEntries({ tags: [tag], page, limit })
}
