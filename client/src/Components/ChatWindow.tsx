import { useEffect, useRef } from 'react'
import type { Message } from '../Types/Chat'
import MessageBubble from './MessageBubble'

export default function ChatWindow({ messages }: { messages: Message[] }) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="chat-window">
      {messages.map((m, idx) => {
        const isLastMessage = idx === messages.length - 1
        const isStreaming = isLastMessage && m.role === 'assistant'

        return (
          <MessageBubble
            key={m.id}
            message={m}
            isStreaming={isStreaming}
          />
        )
      })}
      <div ref={bottomRef} />
    </div>
  )
}
