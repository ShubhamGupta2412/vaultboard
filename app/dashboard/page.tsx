/**
 * Dashboard Page - Protected Route
 * 
 * Main dashboard showing user info and knowledge entries
 */

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getUserProfile } from '@/lib/api/auth-server'
import Link from 'next/link'
import EntriesGrid from '@/components/EntriesGrid'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If no user, redirect to login (middleware should handle this, but double-check)
  if (!user) {
    redirect('/auth/login')
  }

  // Get user profile with role
  const profile = await getUserProfile(user.id)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">VaultBoard</h1>
              <p className="text-sm text-slate-600">Knowledge Management Platform</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-slate-900">{user.email}</p>
                <p className="text-xs text-slate-600 capitalize">
                  {profile?.role || 'Member'}
                </p>
              </div>
              <a
                href="/auth/logout"
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors duration-200"
              >
                Logout
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">
                Knowledge Vault
              </h2>
              <p className="text-slate-600 text-lg">
                Browse, search, and manage your team's knowledge base
              </p>
            </div>
            {(profile?.role === 'admin' || profile?.role === 'manager' || profile?.role === 'member') && (
              <Link
                href="/entries/new"
                className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors duration-200"
              >
                + Create Entry
              </Link>
            )}
          </div>
        </div>

        {/* User Info Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Account Information
            </h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-slate-500">Email</dt>
                <dd className="text-base text-slate-900">{user.email}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-slate-500">User ID</dt>
                <dd className="text-base text-slate-900 font-mono text-xs">
                  {user.id}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-slate-500">Role</dt>
                <dd className="text-base text-slate-900">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-teal-100 text-teal-800 capitalize">
                    {profile?.role || 'Member'}
                  </span>
                </dd>
              </div>
            </dl>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Role Permissions
            </h3>
            <div className="space-y-3">
              {profile?.role === 'admin' && (
                <div className="flex items-start">
                  <svg className="h-5 w-5 text-teal-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-2 text-sm text-slate-700">Full system access and user management</span>
                </div>
              )}
              {(profile?.role === 'admin' || profile?.role === 'manager') && (
                <div className="flex items-start">
                  <svg className="h-5 w-5 text-teal-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-2 text-sm text-slate-700">Create and manage team content</span>
                </div>
              )}
              <div className="flex items-start">
                <svg className="h-5 w-5 text-teal-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="ml-2 text-sm text-slate-700">
                  {profile?.role === 'viewer' ? 'View shared content' : 'Create and edit own content'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Entries Grid */}
        <EntriesGrid userRole={profile?.role || 'viewer'} />
      </main>
    </div>
  )
}
