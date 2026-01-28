import type { Message } from '../Types/Chat'
import SourceCards from './SourceCards'

export default function MessageBubble({
  message,
  isStreaming = false,
}: {
  message: Message
  isStreaming?: boolean
}) {
  const isAssistant = message.role === 'assistant'

  return (
    <div className={`message-bubble ${message.role}`}>
      <div className="message-content">
        {message.content}
        {isAssistant && isStreaming && <span className="typing-cursor">▍</span>}
      </div>

      {message.sources && message.sources.length > 0 && (
        <div className="message-sources">
          <SourceCards sources={message.sources} />
        </div>
      )}
    </div>
  )
}
