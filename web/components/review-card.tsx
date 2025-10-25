"use client"

import { useState } from "react"
import Link from "next/link"
import type { ReviewTask } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle, XCircle, Clock } from "lucide-react"

interface ReviewCardProps {
  task: ReviewTask
  onApprove: (taskId: string, feedback: string) => void
  onReject: (taskId: string, feedback: string) => void
}

export function ReviewCard({ task, onApprove, onReject }: ReviewCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [feedback, setFeedback] = useState(task.feedback || "")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleApprove = async () => {
    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 500))
    onApprove(task.id, feedback)
    setIsSubmitting(false)
  }

  const handleReject = async () => {
    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 500))
    onReject(task.id, feedback)
    setIsSubmitting(false)
  }

  const statusIcon =
    task.status === "approved" ? (
      <CheckCircle className="h-5 w-5 text-green-600" />
    ) : task.status === "rejected" ? (
      <XCircle className="h-5 w-5 text-red-600" />
    ) : (
      <Clock className="h-5 w-5 text-yellow-600" />
    )

  return (
    <Card className={task.status !== "pending" ? "opacity-75" : ""}>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              {statusIcon}
              <CardTitle className="line-clamp-1">{task.articleTitle}</CardTitle>
            </div>
            <CardDescription>
              Submitted by {task.submittedBy} on {task.submittedAt.toLocaleDateString()}
            </CardDescription>
          </div>
          <Badge
            variant={task.status === "approved" ? "default" : task.status === "rejected" ? "destructive" : "secondary"}
          >
            {task.status}
          </Badge>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4 border-t border-border pt-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Your Feedback</label>
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Provide constructive feedback..."
              className="min-h-24"
              disabled={task.status !== "pending"}
            />
          </div>

          {task.status === "pending" && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleReject}
                disabled={isSubmitting}
                className="flex-1 text-red-600 hover:text-red-700 bg-transparent"
              >
                Reject
              </Button>
              <Button onClick={handleApprove} disabled={isSubmitting} className="flex-1">
                Approve
              </Button>
            </div>
          )}

          <Link href={`/article/${task.articleId}`}>
            <Button variant="outline" className="w-full bg-transparent">
              View Article
            </Button>
          </Link>
        </CardContent>
      )}

      {!isExpanded && (
        <CardContent>
          <Button variant="ghost" onClick={() => setIsExpanded(true)} className="w-full justify-start">
            View Details
          </Button>
        </CardContent>
      )}
    </Card>
  )
}
