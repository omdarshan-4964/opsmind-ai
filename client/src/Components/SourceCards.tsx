import type { Source } from '../Types/Chat'

export default function SourceCards({ sources }: { sources: Source[] }) {
  return (
    <div className="flex flex-col gap-2 mt-3">
      {sources.map((s, i) => (
        <div 
          key={i} 
          className="source-card"
          style={{
            animation: `slideInUp 0.3s ease-out ${0.1 + i * 0.1}s both`
          }}
        >
          <div className="font-semibold text-sm">{s.title}</div>
          <div className="text-xs opacity-75">{s.reference}</div>
        </div>
      ))}
    </div>
  )
}
