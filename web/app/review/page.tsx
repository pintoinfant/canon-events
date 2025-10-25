"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useWallet } from "@/lib/wallet-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ThumbsUp, ThumbsDown, AlertCircle } from "lucide-react"
import { useReadContract, useReadContracts, useWriteContract } from "wagmi"
import { abi, address } from "@/lib/abi"
import { formatEther, parseEther } from "viem"
import { shortenAddress } from "@/lib/utils"

interface ReviewArticle {
  id: string
  title: string
  summary: string
  content: string
  author: string
  stakeAmount: string
  votes: {
    for: bigint
    against: bigint
  }
}

export default function ReviewPage() {
  const { isConnected } = useWallet()
  const [articles, setArticles] = useState<ReviewArticle[]>([])
  const { writeContractAsync } = useWriteContract()

  const { data: proposalCount } = useReadContract({
    address,
    abi,
    functionName: "proposalCount",
  })

  const { data: proposals } = useReadContracts({
    contracts: proposalCount
      ? Array.from({ length: Number(proposalCount) }, (_, i) => ({
          address,
          abi,
          functionName: "proposals",
          args: [BigInt(i + 1)],
        }))
      : [],
    query: {
      enabled: !!proposalCount,
    },
  })

  useEffect(() => {
    const fetchArticles = async () => {
      if (proposals) {
        const underReviewProposals = proposals.filter(
          (p) => p.result && !(p.result as unknown as any[])[10], // Not finalized
        )

        const articlePromises = underReviewProposals.map(async (p: any) => {
          const proposal = p.result
          const res = await fetch(
            `https://gateway.lighthouse.storage/ipfs/${proposal[4]}`,
          )
          const articleData = await res.json()
          return {
            id: proposal[0].toString(),
            title: articleData.title,
            summary: articleData.summary,
            content: articleData.content,
            author: proposal[3],
            stakeAmount: formatEther(proposal[5]),
            votes: {
              for: proposal[8],
              against: proposal[9],
            },
          }
        })

        const fetchedArticles = await Promise.all(articlePromises)
        setArticles(fetchedArticles)
      }
    }
    fetchArticles()
  }, [proposals])

  const handleVote = async (articleId: string, voteType: "approve" | "reject") => {
    try {
      await writeContractAsync({
        address,
        abi,
        functionName: "stakeAndVote",
        args: [BigInt(articleId), voteType === "approve" ? 1 : 2],
        value: parseEther("0.1"), // TODO: Make this dynamic
      })
      // Optionally, refetch articles or update UI optimistically
    } catch (error) {
      console.error("Failed to vote:", error)
    }
  }

  if (!isConnected) {
    return (
      <main className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-4 py-16">
          <Link href="/" className="flex items-center gap-2 text-primary hover:underline mb-8">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <Card className="glass rounded-2xl border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-destructive" />
                Wallet Connection Required
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                You need to connect your wallet to review and vote on articles. Please connect your wallet to proceed.
              </p>
              <Link href="/">
                <Button className="rounded-full">Go Back and Connect Wallet</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <Link href="/" className="flex items-center gap-2 text-primary hover:underline mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-sans font-bold text-foreground mb-2">Review Articles</h1>
            <p className="text-muted-foreground">Review and vote on submitted articles to help maintain quality</p>
          </div>
          <Link href="/contribute">
            <Button className="rounded-full">Contribute</Button>
          </Link>
        </div>

        <div className="space-y-4">
          {articles.map((article) => (
            <Link key={article.id} href={`/review/${article.id}`}>
              <Card className="glass rounded-2xl border-white/20 cursor-pointer hover:shadow-lg transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{article.title}</CardTitle>
                      <CardDescription>{article.summary}</CardDescription>
                    </div>
                    {/* <Badge variant="outline" className="rounded-full">
                      {article.stakeAmount} HBAR
                    </Badge> */}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">By {shortenAddress(article.author)}</span>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="w-4 h-4 text-green-500" />
                        <span>{formatEther(article.votes.for)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ThumbsDown className="w-4 h-4 text-red-500" />
                        <span>{formatEther(article.votes.against)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
