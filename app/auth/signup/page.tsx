'use client'

/**
 * Signup Page Component
 * 
 * Provides user registration with email/password and role selection.
 * Includes comprehensive form validation, error handling, and loading states.
 */

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signUp, UserRole } from '@/lib/api/auth'
import Logo from '@/components/Logo'

export default function SignupPage() {
  const router = useRouter()
  
  // Form state
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState<UserRole>('member')
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  /**
   * Validate email format
   */
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')

    // Client-side validation
    if (!fullName || !email || !password || !confirmPassword) {
      setError('Please fill in all fields')
      return
    }

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (!agreeToTerms) {
      setError('You must agree to the terms and conditions')
      return
    }

    setIsLoading(true)

    try {
      // Attempt to sign up
      const result = await signUp(email, password, role, fullName)

      if (result.success) {
        // Redirect to login on success
        router.push('/auth/login?registered=true')
      } else {
        // Display error message
        setError(result.message || 'Failed to create account. Please try again.')
      }
    } catch (err) {
      console.error('Signup error:', err)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center flex flex-col items-center">
          <Logo size="xl" className="mb-6" />
          <h2 className="text-2xl font-semibold text-slate-700 mb-1">
            Create Your Account
          </h2>
          <p className="text-slate-600">
            Join VaultBoard to start managing your knowledge
          </p>
        </div>

        {/* Signup Form */}
        <div className="bg-white shadow-xl rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div
                className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 text-sm"
                role="alert"
              >
                <p className="font-medium">Error</p>
                <p>{error}</p>
              </div>
            )}

            {/* Full Name Input */}
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                autoComplete="name"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 text-slate-900 placeholder:text-slate-400"
                placeholder="John Doe"
                disabled={isLoading}
              />
            </div>

            {/* Email Input */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 text-slate-900 placeholder:text-slate-400"
                placeholder="you@example.com"
                disabled={isLoading}
              />
            </div>

            {/* Password Input */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Password <span className="text-red-500">*</span>
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 text-slate-900 placeholder:text-slate-400"
                placeholder="Min. 8 characters"
                disabled={isLoading}
              />
              <p className="mt-1 text-xs text-slate-500">
                Must be at least 8 characters long
              </p>
            </div>

            {/* Confirm Password Input */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 text-slate-900 placeholder:text-slate-400"
                placeholder="Re-enter your password"
                disabled={isLoading}
              />
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Select Your Role <span className="text-red-500">*</span>
              </label>
              <div className="space-y-3">
                {/* Admin Role */}
                <label className="flex items-start cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="admin"
                    checked={role === 'admin'}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="mt-1 h-4 w-4 text-teal-600 focus:ring-teal-500 border-slate-300"
                    disabled={isLoading}
                  />
                  <div className="ml-3">
                    <span className="block text-sm font-medium text-slate-900">
                      Admin
                    </span>
                    <span className="block text-xs text-slate-500">
                      Full access to all features and user management
                    </span>
                  </div>
                </label>

                {/* Manager Role */}
                <label className="flex items-start cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="manager"
                    checked={role === 'manager'}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="mt-1 h-4 w-4 text-teal-600 focus:ring-teal-500 border-slate-300"
                    disabled={isLoading}
                  />
                  <div className="ml-3">
                    <span className="block text-sm font-medium text-slate-900">
                      Manager
                    </span>
                    <span className="block text-xs text-slate-500">
                      Can create, edit, and manage team content
                    </span>
                  </div>
                </label>

                {/* Member Role */}
                <label className="flex items-start cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="member"
                    checked={role === 'member'}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="mt-1 h-4 w-4 text-teal-600 focus:ring-teal-500 border-slate-300"
                    disabled={isLoading}
                  />
                  <div className="ml-3">
                    <span className="block text-sm font-medium text-slate-900">
                      Member
                    </span>
                    <span className="block text-xs text-slate-500">
                      Can create and edit own content
                    </span>
                  </div>
                </label>

                {/* Viewer Role */}
                <label className="flex items-start cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="viewer"
                    checked={role === 'viewer'}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="mt-1 h-4 w-4 text-teal-600 focus:ring-teal-500 border-slate-300"
                    disabled={isLoading}
                  />
                  <div className="ml-3">
                    <span className="block text-sm font-medium text-slate-900">
                      Viewer
                    </span>
                    <span className="block text-xs text-slate-500">
                      Read-only access to shared content
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
                className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-slate-300 rounded mt-1"
                disabled={isLoading}
                required
              />
              <label htmlFor="terms" className="ml-3 text-sm text-slate-600">
                I agree to the{' '}
                <a href="#" className="text-teal-600 hover:text-teal-700 font-medium">
                  Terms and Conditions
                </a>{' '}
                and{' '}
                <a href="#" className="text-teal-600 hover:text-teal-700 font-medium">
                  Privacy Policy
                </a>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              Already have an account?{' '}
              <Link
                href="/auth/login"
                className="font-medium text-teal-600 hover:text-teal-700 transition-colors duration-200"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-500">
          © 2025 VaultBoard. All rights reserved.
        </p>
      </div>
    </div>
  )
}
