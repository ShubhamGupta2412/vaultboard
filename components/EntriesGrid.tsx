'use client'

/**
 * Entries Grid Component
 * 
 * Displays all entries with search, filter, and pagination
 */

import { useState, useEffect } from 'react'
import SearchBar from './SearchBar'
import EntryCard from './EntryCard'
import { KnowledgeEntry } from '@/lib/api/entries'

const CATEGORIES = ['credential', 'sop', 'link', 'document']
const CLASSIFICATIONS = ['public', 'internal', 'confidential', 'restricted']

export default function EntriesGrid({ userRole }: { userRole: string }) {
  const [entries, setEntries] = useState<KnowledgeEntry[]>([])
  const [filteredEntries, setFilteredEntries] = useState<KnowledgeEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedClassification, setSelectedClassification] = useState<string | null>(null)

  // Fetch entries
  useEffect(() => {
    fetchEntries()
  }, [])

  // Apply filters when entries or filters change
  useEffect(() => {
    filterEntries()
  }, [entries, searchQuery, selectedCategory, selectedClassification])

  const fetchEntries = async () => {
    try {
      const response = await fetch('/api/entries')
      if (!response.ok) throw new Error('Failed to fetch entries')
      const data = await response.json()
      setEntries(data.data || [])
    } catch (error) {
      console.error('Error fetching entries:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterEntries = () => {
    let filtered = [...entries]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        entry =>
          entry.title.toLowerCase().includes(query) ||
          entry.content.toLowerCase().includes(query) ||
          entry.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(entry => entry.category === selectedCategory)
    }

    // Classification filter
    if (selectedClassification) {
      filtered = filtered.filter(entry => entry.classification === selectedClassification)
    }

    setFilteredEntries(filtered)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-12 bg-slate-200 animate-pulse rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-64 bg-slate-200 animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <SearchBar
        onSearch={setSearchQuery}
        placeholder="Search by title, content, or tags..."
        resultsCount={filteredEntries.length}
      />

      {/* Filters */}
      <div className="bg-white rounded-xl shadow p-4">
        <div className="space-y-4">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === null
                    ? 'bg-teal-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                All
              </button>
              {CATEGORIES.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                    selectedCategory === category
                      ? 'bg-teal-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Classification Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Classification
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedClassification(null)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedClassification === null
                    ? 'bg-teal-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                All
              </button>
              {CLASSIFICATIONS.map(classification => (
                <button
                  key={classification}
                  onClick={() => setSelectedClassification(classification)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                    selectedClassification === classification
                      ? 'bg-teal-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {classification}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Entries Grid */}
      {filteredEntries.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-12 text-center">
          <svg
            className="mx-auto h-12 w-12 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-slate-900">No entries found</h3>
          <p className="mt-2 text-sm text-slate-500">
            {entries.length === 0
              ? 'Get started by creating your first knowledge entry.'
              : 'Try adjusting your search or filters.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEntries.map(entry => (
            <EntryCard key={entry.id} entry={entry} userRole={userRole} />
          ))}
        </div>
      )}
    </div>
  )
}
