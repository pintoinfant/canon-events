import { notFound } from "next/navigation"
import Link from "next/link"
import { mockArticles } from "@/lib/mock-data"
import { MarkdownRenderer } from "@/components/markdown-renderer"
import { EditHistoryPanel } from "@/components/edit-history-panel"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"

interface ArticlePageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params
  const article = mockArticles.find((a) => a.slug === slug)

  if (!article) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-foreground">{article.title}</h1>
          <p className="text-muted-foreground mt-2">{article.summary}</p>
          <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
            <span>By {article.createdBy}</span>
            <span>•</span>
            <span>Updated {article.updatedAt.toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {article.imageUrl && (
              <img
                src={article.imageUrl || "/placeholder.svg"}
                alt={article.title}
                className="w-full h-96 object-cover rounded-lg mb-8"
              />
            )}
            <MarkdownRenderer content={article.content} />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <EditHistoryPanel article={article} />
          </div>
        </div>
      </div>
    </main>
  )
}
