import { useState } from 'react'

/* ---------- Types ---------- */
export type HistoryItem = {
  id: string
  title: string
  timestamp: number
  messages: unknown[]
}

type HistorySidebarProps = {
  isOpen: boolean
  onClose: () => void
  history?: HistoryItem[]
  onSelectItem?: (item: HistoryItem) => void
  onDeleteItem?: (id: string) => void
  onClearHistory?: () => void
}

export default function HistorySidebar({
  isOpen,
  onClose,
  history = [],
  onSelectItem,
  onDeleteItem,
  onClearHistory,
}: HistorySidebarProps) {
  const [confirmClear, setConfirmClear] = useState(false)

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div className="history-overlay" onClick={onClose} />

      {/* Sidebar */}
      <aside className="history-sidebar open">
        <div className="history-header">
          <h2>Chat History</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="history-content">
          {history.length === 0 ? (
            <div className="history-empty">
              <p>No saved chats yet</p>
              <span className="empty-icon">📝</span>
            </div>
          ) : (
            <div className="history-list">
              {history.map((item) => (
                <div key={item.id} className="history-item">
                  <button
                    className="history-item-content"
                    onClick={() => {
                      onSelectItem?.(item)
                      onClose()
                    }}
                  >
                    <div className="history-item-title">{item.title}</div>
                    <div className="history-item-time">
                      {new Date(item.timestamp).toLocaleDateString()}
                    </div>
                  </button>

                  {onDeleteItem && (
                    <button
                      className="history-item-delete"
                      onClick={() => onDeleteItem(item.id)}
                      title="Delete"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {history.length > 0 && onClearHistory && (
          <div className="history-footer">
            {confirmClear ? (
              <div className="confirm-delete">
                <p>Clear all history?</p>
                <div className="confirm-buttons">
                  <button
                    className="confirm-btn yes"
                    onClick={() => {
                      onClearHistory()
                      setConfirmClear(false)
                    }}
                  >
                    Yes
                  </button>
                  <button
                    className="confirm-btn no"
                    onClick={() => setConfirmClear(false)}
                  >
                    No
                  </button>
                </div>
              </div>
            ) : (
              <button
                className="clear-history-btn"
                onClick={() => setConfirmClear(true)}
              >
                Clear All History
              </button>
            )}
          </div>
        )}
      </aside>
    </>
  )
}
