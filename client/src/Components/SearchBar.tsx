import { useState } from 'react'

interface SearchBarProps {
  onSearch?: (query: string) => void
  placeholder?: string
}

export default function SearchBar({
  onSearch,
  placeholder = 'Search documents...',
}: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (query.trim()) onSearch?.(query)
  }

  const handleClear = () => {
    setQuery('')
    onSearch?.('')
  }

  return (
    <section className="search-center">
      <form onSubmit={handleSearch} className="search-form">
        <div className={`search-bar ${isFocused ? 'focused' : ''}`}>
          <span className="search-icon">🔍</span>

          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
          />

          {query && (
            <button type="button" onClick={handleClear}>✕</button>
          )}

          <button type="submit">→</button>
        </div>
      </form>
    </section>
  )
}
