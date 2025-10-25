"use client"

import { useState } from "react"
import { mockArticles, mockContributors, mockReviewTasks } from "@/lib/mock-data"
import { AdminArticleTable } from "@/components/admin-article-table"
import { AdminContributorTable } from "@/components/admin-contributor-table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

export default function AdminDashboard() {
  const [articles, setArticles] = useState(mockArticles)
  const [contributors] = useState(mockContributors)

  const handleDeleteArticle = (articleId: string) => {
    setArticles(articles.filter((a) => a.id !== articleId))
  }

  // Calculate stats
  const publishedCount = articles.filter((a) => a.status === "published").length
  const underReviewCount = articles.filter((a) => a.status === "under-review").length
  const draftCount = articles.filter((a) => a.status === "draft").length
  const totalVersions = articles.reduce((sum, a) => sum + a.versions.length, 0)
  const pendingReviews = mockReviewTasks.filter((t) => t.status === "pending").length

  // Chart data
  const chartData = [
    { name: "Published", value: publishedCount },
    { name: "Under Review", value: underReviewCount },
    { name: "Draft", value: draftCount },
  ]

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-4xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">Manage articles, contributors, and platform settings</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Total Articles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{articles.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Published</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{publishedCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Under Review</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{underReviewCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Contributors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{contributors.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Pending Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{pendingReviews}</div>
            </CardContent>
          </Card>
        </div>

        {/* Chart */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Article Status Distribution</CardTitle>
            <CardDescription>Overview of articles by status</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="hsl(var(--color-primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="articles" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="articles">
              Articles{" "}
              <Badge variant="secondary" className="ml-2">
                {articles.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="contributors">
              Contributors{" "}
              <Badge variant="secondary" className="ml-2">
                {contributors.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="articles" className="space-y-4 mt-6">
            <AdminArticleTable articles={articles} onDelete={handleDeleteArticle} />
          </TabsContent>

          <TabsContent value="contributors" className="space-y-4 mt-6">
            <AdminContributorTable contributors={contributors} />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
