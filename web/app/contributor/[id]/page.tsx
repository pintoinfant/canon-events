import { notFound } from "next/navigation"
import Link from "next/link"
import { mockContributors } from "@/lib/mock-data"
import { ContributionTimeline } from "@/components/contribution-timeline"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, Mail, Calendar } from "lucide-react"

interface ContributorPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ContributorPage({ params }: ContributorPageProps) {
  const { id } = await params
  const contributor = mockContributors.find((c) => c.id === id)

  if (!contributor) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>

          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
            {contributor.avatar && (
              <img
                src={contributor.avatar || "/placeholder.svg"}
                alt={contributor.name}
                className="w-24 h-24 rounded-full object-cover"
              />
            )}

            <div className="flex-1">
              <h1 className="text-4xl font-bold text-foreground">{contributor.name}</h1>
              {contributor.bio && <p className="text-muted-foreground mt-2">{contributor.bio}</p>}

              <div className="flex flex-wrap gap-4 mt-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  {contributor.email}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Joined {contributor.joinedAt.toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Contribution History</CardTitle>
                <CardDescription>{contributor.contributions.length} contributions</CardDescription>
              </CardHeader>
              <CardContent>
                <ContributionTimeline contributions={contributor.contributions} />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-3xl font-bold text-primary">{contributor.articlesCount}</div>
                  <div className="text-sm text-muted-foreground">Articles Contributed</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary">{contributor.contributions.length}</div>
                  <div className="text-sm text-muted-foreground">Total Contributions</div>
                </div>
              </CardContent>
            </Card>

            {/* Member Since */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Member Since</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-semibold text-foreground">
                  {contributor.joinedAt.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  {Math.floor((Date.now() - contributor.joinedAt.getTime()) / (1000 * 60 * 60 * 24))} days active
                </div>
              </CardContent>
            </Card>

            {/* Contribution Types */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Contribution Types</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Created</span>
                  <Badge variant="outline">
                    {contributor.contributions.filter((c) => c.type === "created").length}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Edited</span>
                  <Badge variant="outline">{contributor.contributions.filter((c) => c.type === "edited").length}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
