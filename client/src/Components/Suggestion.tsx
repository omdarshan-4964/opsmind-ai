export default function Suggestion({
  title,
  tag,
}: {
  title: string
  tag: string
}) {
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
