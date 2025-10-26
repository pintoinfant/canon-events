"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { useReadContract, useReadContracts } from "wagmi"
import { abi, address } from "@/lib/abi"
import Link from "next/link"
import { Spinner } from "@/components/ui/spinner"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import { useRouter } from "next/navigation"

type ProposalSummary = readonly [
  bigint,
  bigint,
  number,
  `0x${string}`,
  string,
  bigint,
  bigint,
  bigint,
  bigint,
  bigint,
  boolean,
  boolean,
]

export default function AllArticlesPage() {
  const router = useRouter()
  const [articles, setArticles] = useState<any[]>([])
  const { data: proposalCount } = useReadContract({
    abi,
    address,
    functionName: "proposalCount",
  })

  const { data: proposalSummariesData, isLoading } = useReadContracts({
    contracts: Array.from({ length: Number(proposalCount) }, (_, i) => ({
      abi,
      address,
      functionName: "proposalSummary",
      args: [BigInt(i + 1)],
    })),
    query: {
      enabled: !!proposalCount,
    },
  })

  useEffect(() => {
    const fetchArticles = async () => {
      if (proposalSummariesData) {
        const acceptedProposals = proposalSummariesData
          .map((p) => p.result as ProposalSummary | undefined)
          .filter((p): p is ProposalSummary => !!p && p[11] && p[2] === 0) // accepted and is a create proposal

        const articlePromises = acceptedProposals.map(async (p) => {
          const res = await fetch(`https://gateway.lighthouse.storage/ipfs/${p[4]}`)
          const articleData = await res.json()
          return {
            id: p[0].toString(),
            slug: p[0].toString(),
            title: articleData.title,
            summary: articleData.summary,
            status: "published",
            createdBy: p[3],
          }
        })
        const fetchedArticles = await Promise.all(articlePromises)
        setArticles(fetchedArticles.filter((a) => a).reverse()) // Show newest first
      }
    }
    fetchArticles()
  }, [proposalSummariesData])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner className="h-12 w-12" />
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-8">
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-4xl font-bold tracking-tight text-center mb-12 font-sans">All Articles</h1>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <Card key={article.id} className="glass hover:border-primary transition-colors">
              <CardHeader>
                <CardTitle className="font-sans">{article.title}</CardTitle>
                <CardDescription className="font-sans">{article.summary}</CardDescription>
              </CardHeader>
              <CardContent>
                <Link
                  href={`/article/${article.slug}`}
                  className="text-primary font-semibold hover:underline font-sans"
                  prefetch={false}
                >
                  Read More
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  )
}