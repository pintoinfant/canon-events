"use client"

import { SearchBar } from "@/components/search-bar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { useReadContract, useReadContracts } from "wagmi"
import { abi, address } from "@/lib/abi"
import { WalletButton } from "@/components/wallet-button"
import Image from "next/image"
import Link from "next/link"
import { Spinner } from "@/components/ui/spinner"
import { Button } from "@/components/ui/button"

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

export default function Home() {
  const [articles, setArticles] = useState<any[]>([])
  const [totalVersions, setTotalVersions] = useState(0)
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
    const processProposals = async () => {
      if (proposalSummariesData) {
        const allProposals = proposalSummariesData
          .map((p) => p.result as ProposalSummary | undefined)
          .filter((p): p is ProposalSummary => !!p)

        const executedProposals = allProposals.filter((p) => p[11])
        setTotalVersions(executedProposals.length)

        const acceptedCreateProposals = allProposals.filter((p) => p[11] && p[2] === 0) // accepted and is a create proposal

        const articlePromises = acceptedCreateProposals.map(async (p) => {
          try {
            const res = await fetch(`https://gateway.lighthouse.storage/ipfs/${p[4]}`)
            if (!res.ok) return null
            const articleData = await res.json()
            return {
              id: p[0].toString(),
              slug: p[0].toString(),
              title: articleData.title,
              summary: articleData.summary,
              status: "published",
              createdBy: p[3],
            }
          } catch (error) {
            console.error("Failed to fetch article data:", error)
            return null
          }
        })
        const fetchedArticles = await Promise.all(articlePromises)
        setArticles(fetchedArticles.filter((a) => a))
      }
    }
    processProposals()
  }, [proposalSummariesData])

  const featuredArticles = articles.slice(0, 3)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner className="h-12 w-12" />
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="px-4 lg:px-6 h-14 flex items-center border-b">
        <Link href="/" className="flex items-center justify-center">
          <Image src="/canon-logo-new.png" width={40} height={40} alt="Canon" />
          <span className="sr-only">Canon</span>
        </Link>
        <nav className="ml-auto flex items-center gap-4 sm:gap-6">
          <Link href="/review" className="text-sm font-medium hover:underline underline-offset-4">
            Review
          </Link>
          <Link href="/create" className="text-sm font-medium hover:underline underline-offset-4">
            Create
          </Link>
          <WalletButton />
        </nav>
      </header>
      <section className="py-32 px-4 sm:px-6 lg:px-8 border-b border-border relative">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold tracking-tighter sm:text-6xl md:text-7xl font-sans">
            Decentralized Knowledge, <br />
            <span className="text-primary">Canonized by Community.</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto font-sans">
            Canon is a decentralized platform for creating, reviewing, and publishing articles, governed by a community of
            stakers.
          </p>
          <div className="mt-10 max-w-xl mx-auto">
            <SearchBar articles={articles} />
          </div>
        </div>

        <div className="mt-10 grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 text-center">
          <Link href="/create">
            <div className="glass rounded-2xl p-6 hover:scale-105 transition-transform cursor-pointer">
              <div className="flex justify-center mb-3">
                <Image src="/creator.png" alt="Create" width={48} height={48} className="w-12 h-12" />
              </div>
              <div className="text-primary font-sans font-bold text-lg mb-1">Create Info</div>
              <div className="text-sm text-muted-foreground">Submit new articles</div>
            </div>
          </Link>
          <Link href="/review">
            <div className="glass rounded-2xl p-6 hover:scale-105 transition-transform cursor-pointer">
              <div className="flex justify-center mb-3">
                <Image src="/review.png" alt="Review" width={48} height={48} className="w-12 h-12" />
              </div>
              <div className="text-primary font-sans font-bold text-lg mb-1">Review</div>
              <div className="text-sm text-muted-foreground">Vote on submissions</div>
            </div>
          </Link>
          <Link href="/contribute">
            <div className="glass rounded-2xl p-6 hover:scale-105 transition-transform cursor-pointer">
              <div className="flex justify-center mb-3">
                <Image src="/patron.png" alt="Patron" width={48} height={48} className="w-12 h-12" />
              </div>
              <div className="text-primary font-sans font-bold text-lg mb-1">Patrons</div>
              <div className="text-sm text-muted-foreground">Support the creators</div>
            </div>
          </Link>
        </div>

      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight text-center mb-12 font-sans">Featured Articles</h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {featuredArticles.map((article) => (
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
          <div className="mt-12 text-center">
            <Link href="/articles">
              <Button variant="outline">View All Articles</Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/20">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold tracking-tight mb-4 font-sans">Platform Statistics</h2>
          <p className="text-muted-foreground mb-12 font-sans">
            Powered by the community, for the community.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass rounded-2xl p-8 text-center hover:scale-105 transition-transform">
              <div className="text-4xl font-sans font-bold text-primary mb-2">{articles.length}</div>
              <div className="text-muted-foreground font-sans">Articles</div>
            </div>
            <div className="glass rounded-2xl p-8 text-center hover:scale-105 transition-transform">
              <div className="text-4xl font-sans font-bold text-primary mb-2">
                {totalVersions}
              </div>
              <div className="text-muted-foreground font-sans">Total Versions</div>
            </div>
            <div className="glass rounded-2xl p-8 text-center hover:scale-105 transition-transform">
              <div className="text-4xl font-sans font-bold text-primary mb-2">
                {new Set(articles.map((a) => a.createdBy)).size}
              </div>
              <div className="text-muted-foreground font-sans">Patrons</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
