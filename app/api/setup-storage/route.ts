/**
 * Setup Storage Bucket API
 * POST /api/setup-storage
 * 
 * Creates the documents bucket if it doesn't exist
 * Run this once after deployment
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
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

    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()

    if (listError) {
      return NextResponse.json(
        { error: 'Failed to list buckets', details: listError },
        { status: 500 }
      )
    }

    const documentsBucket = buckets?.find(b => b.name === 'documents')

    if (documentsBucket) {
      return NextResponse.json({
        success: true,
        message: 'Documents bucket already exists',
        bucket: documentsBucket
      })
    }

    // Create bucket
    const { data, error } = await supabase.storage.createBucket('documents', {
      public: true,
      fileSizeLimit: 10485760, // 10MB
      allowedMimeTypes: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'text/markdown',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv',
        'application/zip',
      ]
    })

    if (error) {
      console.error('Failed to create bucket:', error)
      return NextResponse.json(
        { 
          error: 'Failed to create storage bucket',
          details: error.message,
          note: 'You may need to create this bucket manually in Supabase Dashboard → Storage'
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Documents bucket created successfully',
      bucket: data
    })
  } catch (error: any) {
    console.error('Setup storage error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

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

    // List all buckets
    const { data: buckets, error } = await supabase.storage.listBuckets()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to list buckets', details: error },
        { status: 500 }
      )
    }

    const documentsBucket = buckets?.find(b => b.name === 'documents')

    return NextResponse.json({
      success: true,
      buckets: buckets,
      documentsConfigured: !!documentsBucket,
      documentsBucket: documentsBucket || null
    })
  } catch (error: any) {
    console.error('Check storage error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
