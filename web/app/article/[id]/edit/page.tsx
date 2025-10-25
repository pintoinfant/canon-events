import { notFound } from "next/navigation"
import Link from "next/link"
import { ArticleEditor } from "@/components/article-editor"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import { createPublicClient, http } from "viem"
import { hederaTestnet } from "@/lib/wagmi"
import { abi, address } from "@/lib/abi"

interface EditPageProps {
  params: {
    id: string
  }
}

async function getArticle(id: string) {
  try {
    const publicClient = createPublicClient({
      chain: hederaTestnet,
      transport: http(),
    })

    const proposal = await publicClient.readContract({
      address,
      abi,
      functionName: "proposalSummary",
      args: [BigInt(id)],
    })

    if (!proposal) return null

    const res = await fetch(
      `https://gateway.lighthouse.storage/ipfs/${proposal[4]}`,
    )
    const articleData = await res.json()

    return {
      id: proposal[0].toString(),
      pageId: proposal[1].toString(),
      slug: proposal[0].toString(),
      title: articleData.title,
      summary: articleData.summary,
      content: articleData.content,
      // Add dummy data for the other required fields
      createdAt: new Date(Number(proposal[6]) * 1000),
      updatedAt: new Date(),
      createdBy: proposal[3],
      status: (proposal[11]
        ? "published"
        : "under-review") as "published" | "under-review",
      versions: [],
      reviewers: [],
    }
  } catch (error) {
    console.error("Failed to fetch article for editing:", error)
    return null
  }
}

export default async function EditPage({ params }: EditPageProps) {
  const { id } = await params
  const article = await getArticle(id)

  if (!article) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href={`/article/${id}`}>
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
