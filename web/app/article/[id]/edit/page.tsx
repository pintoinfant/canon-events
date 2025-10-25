import { notFound } from "next/navigation"
import Link from "next/link"
import { mockArticles } from "@/lib/mock-data"
import { ArticleEditor } from "@/components/article-editor"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"

interface EditPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function EditPage({ params }: EditPageProps) {
  const { slug } = await params
  const article = mockArticles.find((a) => a.slug === slug)

  if (!article) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href={`/article/${slug}`}>
          <Button variant="ghost" size="sm" className="mb-6">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Article
          </Button>
        </Link>
        <ArticleEditor article={article} />
      </div>
    </main>
  )
}
