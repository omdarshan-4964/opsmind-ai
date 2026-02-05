import React from 'react'
import type { Message } from '../Types/Chat'
import SourceCards from './SourceCards'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/github.css'

export default function MessageBubble({
  message,
  isStreaming = false,
  isLoading = false,
}: {
  message: Message
  isStreaming?: boolean
  isLoading?: boolean
}) {
  const isAssistant = message.role === 'assistant'

  return (
    <div className={`mb-4 flex ${isAssistant ? 'justify-start' : 'justify-end'}`}>
      <div
        className={`max-w-[78%] p-4 rounded-lg shadow-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 break-words`}
      >
        <div className="prose prose-sm dark:prose-invert">
          {isAssistant && isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-pulse text-sm text-slate-500">Thinking</div>
              <div className="flex space-x-1">
                <span className="w-1 h-1 bg-slate-500 rounded-full animate-bounce" />
                <span className="w-1 h-1 bg-slate-500 rounded-full animate-bounce delay-75" />
                <span className="w-1 h-1 bg-slate-500 rounded-full animate-bounce delay-150" />
              </div>
            </div>
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={{
                code({ node, inline, className, children, ...props }) {
                  return !inline ? (
                    <pre className="rounded-md overflow-auto bg-slate-900 text-white p-2 text-sm" {...props}>
                      <code className={className}>{String(children)}</code>
                    </pre>
                  ) : (
                    <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded text-sm" {...props}>
                      {children}
                    </code>
                  )
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>

        {isAssistant && isStreaming && (
          <div className="mt-2 text-slate-400">▍</div>
        )}

        {message.sources && message.sources.length > 0 && (
          <div className="mt-3">
            <SourceCards sources={message.sources} />
          </div>
        )}
      </div>
    </div>
  )
}
