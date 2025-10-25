"use client"

import { useState } from "react"
import Link from "next/link"
import { useWallet } from "@/lib/wallet-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ThumbsUp, ThumbsDown, AlertCircle } from "lucide-react"

interface ReviewArticle {
  id: string
  title: string
  summary: string
  content: string
  author: string
  stakeAmount: string
  votes: {
    approve: number
    reject: number
  }
}

const mockReviewArticles: ReviewArticle[] = [
  {
    id: "1",
    title: "Understanding Blockchain Technology",
    summary: "A comprehensive guide to blockchain fundamentals and how it works",
    content:
      "Blockchain is a distributed ledger technology that enables secure and transparent transactions. It uses cryptographic hashing to ensure data integrity and consensus mechanisms to validate transactions...",
    author: "0x1234...5678",
    stakeAmount: "0.5",
    votes: { approve: 8, reject: 2 },
  },
  {
    id: "2",
    title: "Smart Contracts Explained",
    summary: "Deep dive into smart contracts and their applications",
    content:
      "Smart contracts are self-executing contracts with terms written in code. They automatically execute when conditions are met, eliminating the need for intermediaries...",
    author: "0x9876...5432",
    stakeAmount: "0.3",
    votes: { approve: 5, reject: 3 },
  },
  {
    id: "3",
    title: "DeFi Protocols and Yield Farming",
    summary: "Exploring decentralized finance and yield farming strategies",
    content:
      "Decentralized Finance (DeFi) refers to financial services built on blockchain networks. Yield farming involves providing liquidity to earn rewards...",
    author: "0x5555...6666",
    stakeAmount: "0.7",
    votes: { approve: 12, reject: 1 },
  },
]

export default function ReviewPage() {
  const { isConnected } = useWallet()
  const [articles, setArticles] = useState(mockReviewArticles)
  const [selectedArticle, setSelectedArticle] = useState<ReviewArticle | null>(null)
  const [userVotes, setUserVotes] = useState<Record<string, "approve" | "reject" | null>>({})

  const handleVote = (articleId: string, voteType: "approve" | "reject") => {
    setUserVotes((prev) => ({
      ...prev,
      [articleId]: prev[articleId] === voteType ? null : voteType,
    }))

    setArticles((prev) =>
      prev.map((article) => {
        if (article.id === articleId) {
          const currentVote = userVotes[articleId]
          const newVotes = { ...article.votes }

          if (currentVote === "approve") newVotes.approve -= 1
          if (currentVote === "reject") newVotes.reject -= 1

          if (voteType === "approve") newVotes.approve += 1
          if (voteType === "reject") newVotes.reject += 1

          return { ...article, votes: newVotes }
        }
        return article
      }),
    )
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

        <div className="mb-8">
          <h1 className="text-4xl font-sans font-bold text-foreground mb-2">Review Articles</h1>
          <p className="text-muted-foreground">Review and vote on submitted articles to help maintain quality</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {articles.map((article) => (
              <Card
                key={article.id}
                className="glass rounded-2xl border-white/20 cursor-pointer hover:shadow-lg transition-all"
                onClick={() => setSelectedArticle(article)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{article.title}</CardTitle>
                      <CardDescription>{article.summary}</CardDescription>
                    </div>
                    <Badge variant="outline" className="rounded-full">
                      {article.stakeAmount} ETH
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">By {article.author}</span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={userVotes[article.id] === "approve" ? "default" : "outline"}
                        className="rounded-full gap-1"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleVote(article.id, "approve")
                        }}
                      >
                        <ThumbsUp className="w-4 h-4" />
                        {article.votes.approve}
                      </Button>
                      <Button
                        size="sm"
                        variant={userVotes[article.id] === "reject" ? "destructive" : "outline"}
                        className="rounded-full gap-1"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleVote(article.id, "reject")
                        }}
                      >
                        <ThumbsDown className="w-4 h-4" />
                        {article.votes.reject}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div>
            {selectedArticle ? (
              <Card className="glass rounded-2xl border-white/20 sticky top-4">
                <CardHeader>
                  <CardTitle className="text-lg">{selectedArticle.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm text-foreground mb-2">Content Preview</h4>
                    <p className="text-sm text-muted-foreground line-clamp-6">{selectedArticle.content}</p>
                  </div>

                  <div className="border-t border-border pt-4">
                    <h4 className="font-semibold text-sm text-foreground mb-3">Your Vote</h4>
                    <div className="flex gap-2">
                      <Button
                        className="flex-1 rounded-full gap-2"
                        variant={userVotes[selectedArticle.id] === "approve" ? "default" : "outline"}
                        onClick={() => handleVote(selectedArticle.id, "approve")}
                      >
                        <ThumbsUp className="w-4 h-4" />
                        Approve
                      </Button>
                      <Button
                        className="flex-1 rounded-full gap-2"
                        variant={userVotes[selectedArticle.id] === "reject" ? "destructive" : "outline"}
                        onClick={() => handleVote(selectedArticle.id, "reject")}
                      >
                        <ThumbsDown className="w-4 h-4" />
                        Reject
                      </Button>
                    </div>
                  </div>

                  <div className="bg-muted rounded-lg p-3 text-sm">
                    <p className="text-muted-foreground">
                      <strong>Approve:</strong> {selectedArticle.votes.approve}
                    </p>
                    <p className="text-muted-foreground">
                      <strong>Reject:</strong> {selectedArticle.votes.reject}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="glass rounded-2xl border-white/20">
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">Select an article to review</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
