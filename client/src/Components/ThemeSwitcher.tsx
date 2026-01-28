import { useState, useRef, useEffect } from 'react'

type Theme = 'dark' | 'light' | 'green' | 'neon'

type ThemeSwitcherProps = {
  theme: Theme
  onToggle: (theme: Theme) => void
}

export default function ThemeSwitcher({
  theme,
  onToggle,
}: ThemeSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const themes: { id: Theme; label: string; icon: string }[] = [
    { id: 'dark', label: 'Dark', icon: '🌙' },
    { id: 'light', label: 'Light', icon: '🔆' },
    { id: 'green', label: 'Green', icon: '🌿' },
    { id: 'neon', label: 'Neon', icon: '⚡' },
  ]

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="theme-switcher-fixed">
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="theme-switcher-btn"
        aria-label="Switch theme"
      >
        {themes.find((t) => t.id === theme)?.icon}
      </button>

      {isOpen && (
        <div className="theme-menu">
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                onToggle(t.id)
                setIsOpen(false)
              }}
              className={`theme-option ${
                theme === t.id ? 'active' : ''
              }`}
            >
              <span className="icon">{t.icon}</span>
              <span className="label">{t.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
