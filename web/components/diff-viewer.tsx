"use client"

import { useMemo } from "react"

interface DiffViewerProps {
  oldContent: string
  newContent: string
}

export function DiffViewer({ oldContent, newContent }: DiffViewerProps) {
  const diffs = useMemo(() => {
    const oldLines = oldContent.split("\n")
    const newLines = newContent.split("\n")
    const result: Array<{ type: "added" | "removed" | "unchanged"; content: string; lineNum: number }> = []

    let oldIdx = 0
    let newIdx = 0

    while (oldIdx < oldLines.length || newIdx < newLines.length) {
      if (oldIdx >= oldLines.length) {
        result.push({ type: "added", content: newLines[newIdx], lineNum: newIdx + 1 })
        newIdx++
      } else if (newIdx >= newLines.length) {
        result.push({ type: "removed", content: oldLines[oldIdx], lineNum: oldIdx + 1 })
        oldIdx++
      } else if (oldLines[oldIdx] === newLines[newIdx]) {
        result.push({ type: "unchanged", content: oldLines[oldIdx], lineNum: oldIdx + 1 })
        oldIdx++
        newIdx++
      } else {
        result.push({ type: "removed", content: oldLines[oldIdx], lineNum: oldIdx + 1 })
        result.push({ type: "added", content: newLines[newIdx], lineNum: newIdx + 1 })
        oldIdx++
        newIdx++
      }
    }

    return result
  }, [oldContent, newContent])

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-card">
      <div className="space-y-0">
        {diffs.map((diff, idx) => (
          <div
            key={idx}
            className={`px-4 py-2 font-mono text-sm border-b border-border last:border-b-0 ${
              diff.type === "added"
                ? "bg-green-50 dark:bg-green-950 text-green-900 dark:text-green-100"
                : diff.type === "removed"
                  ? "bg-red-50 dark:bg-red-950 text-red-900 dark:text-red-100"
                  : "bg-background text-foreground"
            }`}
          >
            <span className="inline-block w-8 text-muted-foreground">
              {diff.type === "added" ? "+" : diff.type === "removed" ? "-" : " "}
            </span>
            <span className="break-words">{diff.content || "\u00A0"}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
