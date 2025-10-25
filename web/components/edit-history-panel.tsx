"use client"

import { useState } from "react"
import Link from "next/link"
import type { Article } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, User } from "lucide-react"
import { shortenAddress } from "@/lib/utils"

interface EditHistoryPanelProps {
  article: Article
}

export function EditHistoryPanel({ article }: EditHistoryPanelProps) {
  const [expandedVersion, setExpandedVersion] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      {/* Edit Button */}
      <Link href={`/article/${article.slug}/edit`}>
        <Button className="w-full" size="lg">
          Edit Article
        </Button>
      </Link>

      <Link href="/create">
        <Button className="w-full my-4 bg-transparent" size="lg" variant="outline">
          Create New Article
        </Button>
      </Link>

      {/* Article Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Status</CardTitle>
        </CardHeader>
        <CardContent>
          <Badge
            variant={
              article.status === "published" ? "default" : article.status === "under-review" ? "secondary" : "outline"
            }
            className="text-base py-1 px-3"
          >
            {article.status.charAt(0).toUpperCase() + article.status.slice(1)}
          </Badge>
        </CardContent>
      </Card>

      {/* Reviewers */}
      {article.reviewers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Reviewers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {article.reviewers.map((reviewer) => (
              <div key={reviewer.id} className="flex items-start gap-3 pb-3 border-b border-border last:border-b-0">
                <User className="h-4 w-4 mt-1 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{reviewer.name}</div>
                  <div className="text-xs text-muted-foreground">{reviewer.email}</div>
                  <Badge variant="outline" className="mt-1 text-xs">
                    {reviewer.status}
                  </Badge>
                  {reviewer.feedback && (
                    <div className="mt-2 p-2 bg-muted rounded text-xs text-foreground">{reviewer.feedback}</div>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Edit History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Edit History</CardTitle>
          <CardDescription>{article.versions.length} versions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {article.versions.map((version) => (
            <div key={version.id}>
              <button
                onClick={() => setExpandedVersion(expandedVersion === version.id ? null : version.id)}
                className="w-full text-left p-3 hover:bg-muted rounded-lg transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="font-medium text-sm">{version.changeDescription}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <User className="h-3 w-3" />
                      <span>{shortenAddress(version.createdBy)}</span>
                      <span>•</span>
                      <span>{version.createdAt.toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </button>

              {expandedVersion === version.id && (
                <div className="ml-3 mt-2 p-3 bg-muted rounded-lg border border-border text-sm text-foreground">
                  <p className="line-clamp-3">{version.content}</p>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
