import { useState } from 'react'

import ChatWindow from './Components/ChatWindow'
import ChatInput from './Components/ChatInput'
import SearchBar from './Components/SearchBar'
import ThemeSwitcher from './Components/ThemeSwitcher'
import HistorySidebar from './Components/HistorySidebar'

import { useChatSSE } from './Hooks/useChatSSE'

import './App.css'

export default function App() {
  const { messages, sendMessage, loading } = useChatSSE()

  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  type Theme = 'dark' | 'light' | 'green' | 'neon'

const [theme, setTheme] = useState<Theme>('dark')


  const isEmpty = messages.length === 0

  return (
    <div className="app-root" data-theme={theme}>
      <HistorySidebar
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />

      <header className="top-bar">
        <div className="brand">
          <div className="logo">🤖</div>
          <div>
            <div className="title">Document Assistant</div>
            <div className="subtitle">Ask questions about your documents</div>
          </div>
        </div>

        <div className="header-actions">
         
         <ThemeSwitcher
            theme={theme}
            onToggle={(t) => setTheme(t)}
          />
        </div>
      </header>

      <SearchBar onSearch={sendMessage} />

      <main className="main-area">
        {isEmpty ? <Landing /> : <ChatWindow messages={messages} />}
      </main>

      <ChatInput onSend={sendMessage} disabled={loading} />
    </div>
  )
}

/* ---------- Landing Screen ---------- */

function Landing() {
  return (
    <div className="landing">
      <div className="hero-icon">🤖</div>

      <h1>How can I help you today?</h1>
      <p className="hero-subtitle">
        Ask questions about your documents and get instant answers with source
        citations.
      </p>

      <div className="pill-row">
        <span className="pill">💬 Natural Conversations</span>
        <span className="pill">📑 Source Citations</span>
        <span className="pill">🔒 Secure & Private</span>
      </div>

      <div className="suggestions">
        <Suggestion title="What is our company's leave policy?" tag="HR Policy" />
        <Suggestion
          title="How do I submit an expense report?"
          tag="Finance"
        />
      </div>
    </div>
  )
}

function Suggestion({ title, tag }: { title: string; tag: string }) {
  return (
    <div className="suggestion-card">
      <div className="suggestion-icon">📄</div>
      <div>
        <div className="suggestion-title">{title}</div>
        <div className="suggestion-tag">{tag}</div>
      </div>
    </div>
  )
}
