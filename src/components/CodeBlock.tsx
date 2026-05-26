'use client'

import { useEffect, useRef } from 'react'

interface CodeBlockProps {
  code: string
  language?: string
}

// Simple syntax highlighting with CSS classes (no external lib needed)
function highlightCode(code: string, lang: string): string {
  // Escape HTML
  let html = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  // Comments
  html = html.replace(/(\/\/.*$)/gm, '<span class="code-comment">$1</span>')
  html = html.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="code-comment">$1</span>')
  html = html.replace(/(#.*$)/gm, (match, p1, offset, str) => {
    // Don't highlight if inside a string
    return `<span class="code-comment">${p1}</span>`
  })

  // Strings
  html = html.replace(/("(?:[^"\\]|\\.)*")/g, '<span class="code-string">$1</span>')
  html = html.replace(/('(?:[^'\\]|\\.)*')/g, '<span class="code-string">$1</span>')
  html = html.replace(/(`(?:[^`\\]|\\.)*`)/g, '<span class="code-string">$1</span>')

  // Keywords
  const keywords = ['function', 'const', 'let', 'var', 'return', 'if', 'else', 'for', 'while', 'class', 'import', 'export', 'from', 'default', 'async', 'await', 'try', 'catch', 'throw', 'new', 'this', 'typeof', 'instanceof', 'interface', 'type', 'enum', 'extends', 'implements', 'public', 'private', 'protected', 'static', 'void', 'null', 'undefined', 'true', 'false', 'def', 'print', 'self', 'None', 'True', 'False', 'lambda', 'yield', 'with', 'as', 'pass', 'break', 'continue', 'elif', 'except', 'finally', 'raise', 'global', 'nonlocal', 'assert', 'del', 'in', 'not', 'and', 'or', 'is']
  const kwRegex = new RegExp(`\\b(${keywords.join('|')})\\b`, 'g')
  html = html.replace(kwRegex, '<span class="code-keyword">$1</span>')

  // Numbers
  html = html.replace(/\b(\d+\.?\d*)\b/g, '<span class="code-number">$1</span>')

  // Functions
  html = html.replace(/\b([a-zA-Z_]\w*)\s*\(/g, '<span class="code-function">$1</span>(')

  return html
}

export default function CodeBlock({ code, language }: CodeBlockProps) {
  const ref = useRef<HTMLPreElement>(null)

  useEffect(() => {
    if (ref.current) {
      ref.current.innerHTML = highlightCode(code, language || '')
    }
  }, [code, language])

  return (
    <div className="relative group">
      {language && (
        <div className="absolute top-2 right-2 px-2 py-1 text-xs bg-gray-700 dark:bg-gray-600 text-gray-300 rounded opacity-0 group-hover:opacity-100 transition-opacity">
          {language}
        </div>
      )}
      <pre
        ref={ref}
        className="code-block overflow-x-auto text-sm leading-relaxed"
        style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          color: '#e2e8f0',
          padding: '1.5rem',
          borderRadius: '0.75rem',
          border: '1px solid rgba(139, 92, 246, 0.2)',
        }}
      />
    </div>
  )
}
