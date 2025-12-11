/**
 * Entries Page - Protected Route
 * 
 * This is a protected page for viewing knowledge entries.
 */

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function EntriesPage() {
  const supabase = await createClient()
  
  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If no user, redirect to login
  if (!user) {
    redirect('/auth/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/dashboard" className="text-2xl font-bold text-slate-900 hover:text-teal-600 transition-colors">
                VaultBoard
              </Link>
              <nav className="hidden md:flex space-x-4">
                <Link href="/dashboard" className="text-slate-600 hover:text-slate-900 px-3 py-2 rounded-md text-sm font-medium">
                  Dashboard
                </Link>
                <Link href="/entries" className="text-teal-600 px-3 py-2 rounded-md text-sm font-medium">
                  Entries
                </Link>
              </nav>
            </div>
            <a
              href="/auth/logout"
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors duration-200"
            >
              Logout
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Knowledge Entries</h1>
          <p className="text-slate-600">Manage and view your knowledge base entries</p>
        </div>

        {/* Empty State */}
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">No entries yet</h2>
            <p className="text-slate-600 mb-6">
              Start building your knowledge base by creating your first entry.
            </p>
            <button
              className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors duration-200 disabled:opacity-50"
              disabled
            >
              Create First Entry
            </button>
            <p className="mt-4 text-sm text-slate-500">
              Entry creation feature coming soon!
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
