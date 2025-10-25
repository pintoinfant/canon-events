"use client"

import Link from "next/link"
import type { ContributionRecord } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Edit, Plus } from "lucide-react"

interface ContributionTimelineProps {
  contributions: ContributionRecord[]
}

export function ContributionTimeline({ contributions }: ContributionTimelineProps) {
  if (contributions.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No contributions yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {contributions.map((contribution, idx) => (
        <div key={idx} className="flex gap-4">
          {/* Timeline dot */}
          <div className="flex flex-col items-center">
            <div className="w-3 h-3 rounded-full bg-primary mt-2" />
            {idx < contributions.length - 1 && <div className="w-0.5 h-12 bg-border mt-2" />}
          </div>

          {/* Content */}
          <div className="flex-1 pb-4">
            <div className="flex items-center gap-2 mb-1">
              {contribution.type === "created" ? (
                <Plus className="h-4 w-4 text-green-600" />
              ) : (
                <Edit className="h-4 w-4 text-blue-600" />
              )}
              <span className="font-medium text-foreground">
                {contribution.type === "created" ? "Created" : "Edited"}
              </span>
              <Badge variant="outline" className="text-xs">
                {contribution.type}
              </Badge>
            </div>
            <Link href={`/article/${contribution.articleId}`} className="text-primary hover:underline">
              {contribution.articleTitle}
            </Link>
            <div className="text-sm text-muted-foreground mt-1">{contribution.date.toLocaleDateString()}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
