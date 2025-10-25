"use client"

import { useState } from "react"
import Link from "next/link"
import { mockReviewTasks } from "@/lib/mock-data"
import { ReviewCard } from "@/components/review-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function ReviewerDashboard() {
  const [tasks, setTasks] = useState(mockReviewTasks)

  const handleApprove = (taskId: string, feedback: string) => {
    setTasks(tasks.map((task) => (task.id === taskId ? { ...task, status: "approved" as const, feedback } : task)))
  }

  const handleReject = (taskId: string, feedback: string) => {
    setTasks(tasks.map((task) => (task.id === taskId ? { ...task, status: "rejected" as const, feedback } : task)))
  }

  const pendingTasks = tasks.filter((t) => t.status === "pending")
  const approvedTasks = tasks.filter((t) => t.status === "approved")
  const rejectedTasks = tasks.filter((t) => t.status === "rejected")

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Reviewer Dashboard</h1>
            <p className="text-muted-foreground mt-2">Review and approve article submissions</p>
          </div>
          <Link href="/create">
            <Button className="rounded-full">Create Article</Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Pending Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{pendingTasks.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{approvedTasks.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Rejected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{rejectedTasks.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Review Tasks */}
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending">
              Pending{" "}
              <Badge variant="secondary" className="ml-2">
                {pendingTasks.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="approved">
              Approved{" "}
              <Badge variant="secondary" className="ml-2">
                {approvedTasks.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected{" "}
              <Badge variant="secondary" className="ml-2">
                {rejectedTasks.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4 mt-6">
            {pendingTasks.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">No pending reviews</CardContent>
              </Card>
            ) : (
              pendingTasks.map((task) => (
                <ReviewCard key={task.id} task={task} onApprove={handleApprove} onReject={handleReject} />
              ))
            )}
          </TabsContent>

          <TabsContent value="approved" className="space-y-4 mt-6">
            {approvedTasks.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">No approved reviews yet</CardContent>
              </Card>
            ) : (
              approvedTasks.map((task) => (
                <ReviewCard key={task.id} task={task} onApprove={handleApprove} onReject={handleReject} />
              ))
            )}
          </TabsContent>

          <TabsContent value="rejected" className="space-y-4 mt-6">
            {rejectedTasks.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">No rejected reviews yet</CardContent>
              </Card>
            ) : (
              rejectedTasks.map((task) => (
                <ReviewCard key={task.id} task={task} onApprove={handleApprove} onReject={handleReject} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
