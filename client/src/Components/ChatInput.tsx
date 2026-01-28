import { useState } from 'react'

export default function ChatInput({
  onSend,
  disabled,
}: {
  onSend: (text: string) => void
  disabled: boolean
}) {
  const [value, setValue] = useState('')

  const submit = () => {
    if (!value.trim()) return
    onSend(value)
    setValue('')
  }

  return (
    <div className="chat-input">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
        placeholder="Ask something..."
        disabled={disabled}
      />
      <button onClick={submit} disabled={disabled} className="send-button">
        {disabled ? (
          <span className="flex items-center gap-2">
            <span className="loading-dots">
              <span className="loading-dot"></span>
              <span className="loading-dot"></span>
              <span className="loading-dot"></span>
            </span>
          </span>
        ) : (
          'Send'
        )}
      </button>
    </div>
  )
}
