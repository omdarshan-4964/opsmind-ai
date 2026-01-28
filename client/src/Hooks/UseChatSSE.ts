'use client'

import { useState, useCallback } from 'react'
import type { Message, Source } from '../Types/Chat'


interface StreamChunk {
  type: 'content' | 'sources' | 'done'
  data?: string
  sources?: Source[]
}

export function useChatSSE() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
    }

    setMessages((prev) => [...prev, userMessage])
    setLoading(true)

    // Create assistant message placeholder
    const assistantId = (Date.now() + 1).toString()
    let assistantContent = ''
    let assistantSources: Source[] = []

    setMessages((prev) => [
      ...prev,
      {
        id: assistantId,
        role: 'assistant',
        content: assistantContent,
        streaming: true,
      },
    ])

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: text }),
      })

      if (!response.ok) throw new Error('Failed to send message')

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) throw new Error('No response body')

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n').filter((line) => line.trim())

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6)) as StreamChunk

              if (data.type === 'content' && data.data) {
                assistantContent += data.data

                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId
                      ? { ...m, content: assistantContent, streaming: true }
                      : m,
                  ),
                )
              } else if (data.type === 'sources' && data.sources) {
                assistantSources = data.sources

                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId
                      ? { ...m, sources: assistantSources }
                      : m,
                  ),
                )
              } else if (data.type === 'done') {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId
                      ? {
                          ...m,
                          content: assistantContent,
                          sources: assistantSources,
                          streaming: false,
                        }
                      : m,
                  ),
                )
              }
            } catch {
              // Skip malformed JSON
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error)

      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? {
                ...m,
                content: 'Error: Failed to get response. Please try again.',
                streaming: false,
              }
            : m,
        ),
      )
    } finally {
      setLoading(false)
    }
  }, [])

  return { messages, sendMessage, loading }
}
