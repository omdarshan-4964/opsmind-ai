'use client'

import { useState, useEffect } from 'react'

export interface HistoryItem {
  id: string
  title: string
  timestamp: number
  messages: Array<{ role: string; content: string }>
}

export function useHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('chatHistory')
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory))
      } catch (error) {
        console.error('[v0] Failed to load history:', error)
      }
    }
    setIsLoaded(true)
  }, [])

  // Save history to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('chatHistory', JSON.stringify(history))
    }
  }, [history, isLoaded])

  const saveChat = (messages: Array<{ role: string; content: string }>) => {
    if (messages.length === 0) return

    const firstUserMessage = messages.find((m) => m.role === 'user')?.content || 'New Chat'
    const title = firstUserMessage.substring(0, 50)

    const newItem: HistoryItem = {
      id: Date.now().toString(),
      title,
      timestamp: Date.now(),
      messages,
    }

    setHistory((prev) => [newItem, ...prev])
    return newItem.id
  }

  const deleteItem = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id))
  }

  const clearHistory = () => {
    setHistory([])
  }

  const getItem = (id: string) => {
    return history.find((item) => item.id === id)
  }

  return {
    history,
    saveChat,
    deleteItem,
    clearHistory,
    getItem,
  }
}
