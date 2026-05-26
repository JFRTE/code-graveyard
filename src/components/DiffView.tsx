'use client'

interface DiffViewProps {
  oldCode: string
  newCode: string
}

export default function DiffView({ oldCode, newCode }: DiffViewProps) {
  const oldLines = oldCode.split('\n')
  const newLines = newCode.split('\n')

  // Build a proper line-by-line diff preserving order
  const diffLines: { type: 'same' | 'removed' | 'added'; content: string }[] = []
  const maxLen = Math.max(oldLines.length, newLines.length)

  let oi = 0
  let ni = 0

  while (oi < oldLines.length || ni < newLines.length) {
    if (oi >= oldLines.length) {
      // Remaining new lines are additions
      diffLines.push({ type: 'added', content: newLines[ni] })
      ni++
    } else if (ni >= newLines.length) {
      // Remaining old lines are removals
      diffLines.push({ type: 'removed', content: oldLines[oi] })
      oi++
    } else if (oldLines[oi] === newLines[ni]) {
      // Same line
      diffLines.push({ type: 'same', content: oldLines[oi] })
      oi++
      ni++
    } else {
      // Look ahead to find if this old line appears later in new (addition before it)
      const newIdx = newLines.indexOf(oldLines[oi], ni)
      const oldIdx = oldLines.indexOf(newLines[ni], oi)

      if (newIdx !== -1 && (oldIdx === -1 || newIdx - ni < oldIdx - oi)) {
        // New lines before the matching old line are additions
        while (ni < newIdx) {
          diffLines.push({ type: 'added', content: newLines[ni] })
          ni++
        }
      } else if (oldIdx !== -1) {
        // Old lines before the matching new line are removals
        while (oi < oldIdx) {
          diffLines.push({ type: 'removed', content: oldLines[oi] })
          oi++
        }
      } else {
        // Both lines differ, mark as removed + added
        diffLines.push({ type: 'removed', content: oldLines[oi] })
        diffLines.push({ type: 'added', content: newLines[ni] })
        oi++
        ni++
      }
    }
  }

  const removedCount = diffLines.filter(l => l.type === 'removed').length
  const addedCount = diffLines.filter(l => l.type === 'added').length

  return (
    <div className="rounded-xl overflow-hidden border border-gray-300 dark:border-gray-700">
      <div className="flex items-center gap-4 px-4 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">📊 Code Diff</span>
        <span className="text-xs text-red-500">- {removedCount} 行</span>
        <span className="text-xs text-green-500">+ {addedCount} 行</span>
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
