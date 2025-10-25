"use client"

import { useMemo } from "react"

interface DiffViewerProps {
  oldContent: string
  newContent: string
  showUnchangedContext?: number // future enhancement
}

/**
 * DiffViewer now renders ONLY changed lines (added / removed).
 * Unchanged lines are suppressed to focus reviewer attention on modifications.
 */
export function DiffViewer({ oldContent, newContent }: DiffViewerProps) {
  const changed = useMemo(() => {
    const oldLines = oldContent.split("\n")
    const newLines = newContent.split("\n")
    const result: Array<{ type: "added" | "removed"; content: string; oldLine?: number; newLine?: number }> = []

    let oldIdx = 0
    let newIdx = 0

    while (oldIdx < oldLines.length || newIdx < newLines.length) {
      if (oldIdx >= oldLines.length) {
        // remaining new lines are additions
        result.push({ type: "added", content: newLines[newIdx], newLine: newIdx + 1 })
        newIdx++
      } else if (newIdx >= newLines.length) {
        // remaining old lines are removals
        result.push({ type: "removed", content: oldLines[oldIdx], oldLine: oldIdx + 1 })
        oldIdx++
      } else if (oldLines[oldIdx] === newLines[newIdx]) {
        // unchanged: skip
        oldIdx++
        newIdx++
      } else {
        // changed pair
        result.push({ type: "removed", content: oldLines[oldIdx], oldLine: oldIdx + 1 })
        result.push({ type: "added", content: newLines[newIdx], newLine: newIdx + 1 })
        oldIdx++
        newIdx++
      }
    }

    return result
  }, [oldContent, newContent])

  if (changed.length === 0) {
    return (
      <div className="border border-border rounded-lg p-4 text-sm text-muted-foreground bg-card">
        No changes detected.
      </div>
    )
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-card">
      <div className="divide-y divide-border">
        {changed.map((diff, idx) => (
          <div
            key={idx}
            className={`px-5 py-2.5 font-mono text-sm flex items-start gap-3 ${
              diff.type === "added"
                ? "bg-green-50 dark:bg-green-950 text-green-900 dark:text-green-100"
                : "bg-red-50 dark:bg-red-950 text-red-900 dark:text-red-100"
            }`}
          >
            <span className="text-xs min-w-12 text-muted-foreground tabular-nums">
              {diff.type === "added"
                ? `+${diff.newLine}`
                : `-${diff.oldLine}`}
            </span>
            <span className="flex-1 whitespace-pre-wrap break-words">{diff.content || "\u00A0"}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
