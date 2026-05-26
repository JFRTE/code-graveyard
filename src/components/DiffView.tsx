'use client'

interface DiffViewProps {
  oldCode: string
  newCode: string
}

// Simple line-by-line diff visualization
export default function DiffView({ oldCode, newCode }: DiffViewProps) {
  const oldLines = oldCode.split('\n')
  const newLines = newCode.split('\n')

  // Simple LCS-based diff
  const maxLen = Math.max(oldLines.length, newLines.length)
  const diffLines: { type: 'same' | 'removed' | 'added'; content: string }[] = []

  const oldSet = new Set(oldLines)
  const newSet = new Set(newLines)

  // Lines only in old (removed)
  oldLines.forEach(line => {
    if (!newSet.has(line)) {
      diffLines.push({ type: 'removed', content: line })
    }
  })

  // Lines only in new (added)
  newLines.forEach(line => {
    if (!oldSet.has(line)) {
      diffLines.push({ type: 'added', content: line })
    }
  })

  // Lines in both (unchanged)
  oldLines.forEach(line => {
    if (newSet.has(line)) {
      diffLines.push({ type: 'same', content: line })
    }
  })

  // Sort: removed first, then same, then added
  const sortOrder = { removed: 0, same: 1, added: 2 }
  diffLines.sort((a, b) => sortOrder[a.type] - sortOrder[b.type])

  return (
    <div className="rounded-xl overflow-hidden border border-gray-300 dark:border-gray-700">
      <div className="flex items-center gap-4 px-4 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">📊 Code Diff</span>
        <span className="text-xs text-red-500">- {oldLines.filter(l => !newSet.has(l)).length} 行</span>
        <span className="text-xs text-green-500">+ {newLines.filter(l => !oldSet.has(l)).length} 行</span>
      </div>
      <pre className="text-sm overflow-x-auto" style={{ background: '#0d1117', padding: '1rem' }}>
        <code>
          {diffLines.map((line, i) => (
            <div
              key={i}
              className={`px-2 ${
                line.type === 'removed'
                  ? 'bg-red-500/10 text-red-400'
                  : line.type === 'added'
                  ? 'bg-green-500/10 text-green-400'
                  : 'text-gray-400'
              }`}
            >
              <span className="select-none mr-3 opacity-50">
                {line.type === 'removed' ? '-' : line.type === 'added' ? '+' : ' '}
              </span>
              {line.content || ' '}
            </div>
          ))}
        </code>
      </pre>
    </div>
  )
}
