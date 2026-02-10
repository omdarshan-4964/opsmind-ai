import { useState, useRef, useEffect, type KeyboardEvent } from 'react'
import ReactMarkdown from 'react-markdown'
import {
  Send,
  PanelLeftClose,
  PanelLeft,
  MessageSquare,
  Sparkles,
  FileText,
  Shield,
  Zap,
  Settings,
  LogOut,
  ChevronDown,
  Plus,
  Clock,
  Bot,
  User,
} from 'lucide-react'

import { useChatSSE } from './Hooks/UseChatSSE'
import type { Message, Source } from './Types/Chat'

export default function App() {
  const { messages, sendMessage, loading } = useChatSSE()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [input, setInput] = useState('')
  const [profileOpen, setProfileOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const isEmpty = messages.length === 0

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 200)}px`
    }
  }, [input])

  const handleSend = () => {
    if (!input.trim() || loading) return
    sendMessage(input.trim())
    setInput('')
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleSuggestionClick = (query: string) => {
    sendMessage(query)
  }

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -right-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute -bottom-20 left-1/3 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-72' : 'w-0'
        } transition-all duration-300 ease-in-out shrink-0 relative z-20`}
      >
        <div
          className={`${
            sidebarOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
          } transition-all duration-300 w-72 h-full bg-slate-900/80 backdrop-blur-xl border-r border-slate-800/50 flex flex-col`}
        >
          {/* Sidebar Header */}
          <div className="p-4 border-b border-slate-800/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="font-bold text-lg text-white">OpsMind</h1>
                  <p className="text-xs text-slate-400">Enterprise AI</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-lg hover:bg-slate-800/50 text-slate-400 hover:text-white transition-colors"
              >
                <PanelLeftClose className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* New Chat Button */}
          <div className="p-3">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-linear-to-r from-blue-600/20 to-cyan-500/20 border border-blue-500/30 hover:border-blue-400/50 text-white transition-all hover:shadow-lg hover:shadow-blue-500/10 group">
              <Plus className="w-5 h-5 text-blue-400 group-hover:rotate-90 transition-transform duration-300" />
              <span className="font-medium">New Conversation</span>
            </button>
          </div>

          {/* Chat History */}
          <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-2">
              Recent Chats
            </p>
            {[
              { title: 'Leave Policy Questions', time: '2 hours ago' },
              { title: 'Expense Report Help', time: 'Yesterday' },
              { title: 'Onboarding Process', time: '3 days ago' },
              { title: 'Benefits Overview', time: 'Last week' },
            ].map((chat, i) => (
              <button
                key={i}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800/50 text-left transition-colors group"
              >
                <MessageSquare className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-300 truncate group-hover:text-white transition-colors">
                    {chat.title}
                  </p>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {chat.time}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* Admin Profile */}
          <div className="p-3 border-t border-slate-800/50">
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-linear-to-br from-slate-700 to-slate-600 flex items-center justify-center ring-2 ring-slate-700">
                  <User className="w-5 h-5 text-slate-300" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-white">Admin User</p>
                  <p className="text-xs text-slate-400">admin@company.com</p>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                    profileOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Profile Dropdown */}
              {profileOpen && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden">
                  <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-800/50 transition-colors text-left">
                    <Settings className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-300">Settings</span>
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-800/50 transition-colors text-left text-red-400">
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm">Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        {/* Header */}
        <header className="sticky top-0 z-10 px-6 py-4 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
              {!sidebarOpen && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 rounded-lg hover:bg-slate-800/50 text-slate-400 hover:text-white transition-colors"
                >
                  <PanelLeft className="w-5 h-5" />
                </button>
              )}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-linear-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="font-semibold text-white">Document Assistant</h2>
                  <p className="text-xs text-slate-400">Powered by OpsMind AI</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Online
              </span>
            </div>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-6 py-8">
            {isEmpty ? (
              <LandingScreen onSuggestionClick={handleSuggestionClick} />
            ) : (
              <div className="space-y-6">
                {messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))}
                {loading && messages[messages.length - 1]?.role === 'user' && (
                  <ThinkingIndicator />
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="sticky bottom-0 px-6 py-4 bg-linear-to-t from-slate-950 via-slate-950/95 to-transparent">
          <div className="max-w-4xl mx-auto">
            {/* Glassmorphism Input */}
            <div className="relative bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl shadow-black/20">
              <div className="flex items-end gap-3 p-3">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask anything about your documents..."
                  rows={1}
                  className="flex-1 bg-transparent text-white placeholder-slate-400 resize-none focus:outline-none text-base py-2 px-2 max-h-48 scrollbar-thin scrollbar-thumb-slate-700"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || loading}
                  className={`p-3 rounded-xl transition-all duration-200 shrink-0 ${
                    input.trim() && !loading
                      ? 'bg-linear-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Disclaimer Footer */}
            <p className="text-center text-xs text-slate-500 mt-3">
              OpsMind may produce inaccurate information. Always verify critical details with official sources.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

/* ---------- Landing Screen ---------- */

function LandingScreen({ onSuggestionClick }: { onSuggestionClick: (query: string) => void }) {
  const suggestions = [
    { title: "What is our company's leave policy?", tag: 'HR Policy', icon: FileText },
    { title: 'How do I submit an expense report?', tag: 'Finance', icon: FileText },
    { title: 'Explain the onboarding process', tag: 'HR', icon: FileText },
    { title: 'What are the security protocols?', tag: 'IT Security', icon: Shield },
  ]

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      {/* Animated Logo */}
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-3xl bg-linear-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-2xl shadow-blue-500/30">
          <Sparkles className="w-12 h-12 text-white" />
        </div>
        <div className="absolute inset-0 rounded-3xl bg-linear-to-br from-blue-600 to-cyan-500 blur-2xl opacity-40 animate-pulse" />
      </div>

      <h1 className="text-4xl font-bold text-white mb-3">
        How can I help you today?
      </h1>
      <p className="text-slate-400 text-lg mb-8 max-w-md">
        Ask questions about your documents and get instant answers with verified source citations.
      </p>

      {/* Feature Pills */}
      <div className="flex flex-wrap justify-center gap-3 mb-10">
        {[
          { icon: MessageSquare, label: 'Natural Conversations' },
          { icon: FileText, label: 'Source Citations' },
          { icon: Shield, label: 'Enterprise Security' },
          { icon: Zap, label: 'Instant Answers' },
        ].map((feature, i) => (
          <span
            key={i}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700/50 text-slate-300 text-sm"
          >
            <feature.icon className="w-4 h-4 text-blue-400" />
            {feature.label}
          </span>
        ))}
      </div>

      {/* Suggestion Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
        {suggestions.map((suggestion, i) => (
          <button
            key={i}
            onClick={() => onSuggestionClick(suggestion.title)}
            className="group flex items-start gap-4 p-4 rounded-xl bg-slate-900/50 border border-slate-800/50 hover:border-blue-500/30 hover:bg-slate-800/50 transition-all text-left"
          >
            <div className="p-2 rounded-lg bg-slate-800 group-hover:bg-blue-600/20 transition-colors">
              <suggestion.icon className="w-5 h-5 text-slate-400 group-hover:text-blue-400 transition-colors" />
            </div>
            <div>
              <p className="text-white font-medium group-hover:text-blue-400 transition-colors">
                {suggestion.title}
              </p>
              <p className="text-sm text-slate-500">{suggestion.tag}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

/* ---------- Message Bubble ---------- */

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {/* AI Avatar */}
      {!isUser && (
        <div className="shrink-0">
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-slate-700 to-slate-800 flex items-center justify-center border border-slate-700">
            <Bot className="w-5 h-5 text-slate-300" />
          </div>
        </div>
      )}

      <div className={`max-w-[75%] ${isUser ? 'order-1' : ''}`}>
        {/* Message Content */}
        <div
          className={`px-5 py-3 rounded-2xl ${
            isUser
              ? 'bg-linear-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/20'
              : 'bg-slate-900 text-slate-100'
          } ${message.streaming ? 'animate-pulse' : ''}`}
        >
          {isUser ? (
            <p className="text-white leading-relaxed">{message.content}</p>
          ) : (
            <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-slate-800 prose-pre:border prose-pre:border-slate-700 prose-code:text-blue-400 prose-code:before:content-none prose-code:after:content-none">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          )}
        </div>

        {/* Evidence Badges (Citations) */}
        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {message.sources.map((source, index) => (
              <EvidenceBadge key={index} source={source} />
            ))}
          </div>
        )}
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="shrink-0 order-2">
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <User className="w-5 h-5 text-white" />
          </div>
        </div>
      )}
    </div>
  )
}

/* ---------- Evidence Badge (Citation) ---------- */

function EvidenceBadge({ source }: { source: Source }) {
  return (
    <button className="group flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:border-blue-500/50 hover:bg-slate-800 transition-all">
      <FileText className="w-4 h-4 text-blue-400" />
      <span className="text-sm text-slate-300 group-hover:text-white transition-colors">
        {source.title}
      </span>
      {source.reference && (
        <>
          <span className="text-slate-600">•</span>
          <span className="text-xs text-slate-500">{source.reference}</span>
        </>
      )}
    </button>
  )
}

/* ---------- Thinking Indicator ---------- */

function ThinkingIndicator() {
  return (
    <div className="flex gap-4">
      {/* Glowing AI Avatar */}
      <div className="shrink-0 relative">
        <div className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
          <Bot className="w-5 h-5 text-white animate-pulse" />
        </div>
        <div className="absolute inset-0 rounded-xl bg-linear-to-br from-blue-600 to-cyan-500 blur-lg opacity-50 animate-pulse" />
      </div>

      {/* Thinking Message */}
      <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-slate-900">
        <div className="flex gap-1">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        <span className="text-slate-400 text-sm">Analyzing documents...</span>
      </div>
    </div>
  )
}
