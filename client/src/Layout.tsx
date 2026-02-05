import React from 'react'
import HistorySidebar from './Components/HistorySidebar'
import ThemeSwitcher from './Components/ThemeSwitcher'
import SearchBar from './Components/SearchBar'
import ChatWindow from './Components/ChatWindow'
import ChatInput from './Components/ChatInput'

export default function Layout() {
  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <aside className="w-72 border-r border-slate-200 dark:border-slate-800 p-4 hidden md:block">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-2xl">🤖</div>
            <div className="text-lg font-semibold">OpsMind</div>
          </div>
          <ThemeSwitcher theme="dark" onToggle={() => {}} />
        </div>

        <div className="mb-4">
          <SearchBar onSearch={() => {}} />
        </div>

        <div className="overflow-auto max-h-[70vh]">
          <HistorySidebar isOpen={true} onClose={() => {}} />
        </div>
      </aside>

      <main className="flex-1 p-4 flex flex-col">
        <div className="flex-1 overflow-auto">
          <ChatWindow />
        </div>

        <div className="mt-4">
          <ChatInput onSend={() => {}} disabled={false} />
        </div>
      </main>
    </div>
  )
}
