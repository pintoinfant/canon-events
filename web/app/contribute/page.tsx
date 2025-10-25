"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useWallet } from "@/lib/wallet-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ArrowLeft, AlertCircle, Plus } from "lucide-react"
import { NFTBadge } from "@/components/nft-badge"

interface ContributionArticle {
  id: string
  title: string
  summary: string
  author: string
  contributions: number
  status: "published" | "under-review" | "draft"
}

const mockContributionArticles: ContributionArticle[] = [
  {
    id: "1",
    title: "Understanding Blockchain Technology",
    summary: "A comprehensive guide to blockchain fundamentals",
    author: "Alice",
    contributions: 12,
    status: "published",
  },
  {
    id: "2",
    title: "Smart Contracts Explained",
    summary: "Deep dive into smart contracts and their applications",
    author: "Bob",
    contributions: 8,
    status: "published",
  },
  {
    id: "3",
    title: "DeFi Protocols and Yield Farming",
    summary: "Exploring decentralized finance strategies",
    author: "Carol",
    contributions: 5,
    status: "under-review",
  },
  {
    id: "4",
    title: "NFTs and Digital Ownership",
    summary: "Understanding non-fungible tokens",
    author: "David",
    contributions: 3,
    status: "draft",
  },
]

export default function ContributePage() {
  const { isConnected, address } = useWallet()
  const [selectedArticle, setSelectedArticle] = useState<ContributionArticle | null>(null)
  const [contribution, setContribution] = useState("")
  const [contributionAmount, setContributionAmount] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [showBadge, setShowBadge] = useState(false)

  const handleSubmitContribution = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedArticle || !contribution.trim()) {
      alert("Please select an article and write your contribution")
      return
    }

    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsSubmitting(false)
    setSubmitted(true)
    setShowBadge(true)
    setContribution("")
    setContributionAmount("")
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
                You need to connect your wallet to contribute to articles. Please connect your wallet to proceed.
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
          <h1 className="text-4xl font-sans font-bold text-foreground mb-2">Contribute to Articles</h1>
          <p className="text-muted-foreground">
            Help improve existing articles by adding your knowledge and support creators with crypto contributions
          </p>
        </div>

        {submitted && (
          <Card className="glass rounded-2xl border-white/20 mb-6 bg-green-50">
            <CardContent className="pt-6">
              <p className="text-green-800 font-medium">
                Your contribution has been submitted successfully! It will be reviewed before being added to the
                article.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {selectedArticle ? (
              <Card className="glass rounded-2xl border-white/20">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-2xl mb-2">{selectedArticle.title}</CardTitle>
                      <CardDescription>{selectedArticle.summary}</CardDescription>
                    </div>
                    <Badge
                      variant={
                        selectedArticle.status === "published"
                          ? "default"
                          : selectedArticle.status === "under-review"
                            ? "secondary"
                            : "outline"
                      }
                      className="rounded-full"
                    >
                      {selectedArticle.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmitContribution} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Your Contribution</label>
                      <Textarea
                        placeholder="Add your knowledge, corrections, or improvements to this article..."
                        value={contribution}
                        onChange={(e) => setContribution(e.target.value)}
                        className="rounded-lg glass-strong min-h-48"
                        required
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        {contribution.length} characters • Minimum 50 characters required
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Support with Crypto (Optional)
                      </label>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          placeholder="0.0"
                          step="0.001"
                          min="0"
                          value={contributionAmount}
                          onChange={(e) => setContributionAmount(e.target.value)}
                          className="rounded-lg glass-strong"
                        />
                        <span className="flex items-center px-3 bg-white/10 rounded-lg text-sm font-medium text-foreground">
                          ETH
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Like buying a coffee for the creator - optional but appreciated!
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        disabled={isSubmitting || contribution.length < 50}
                        className="rounded-full flex-1 bg-primary text-primary-foreground hover:opacity-90"
                      >
                        {isSubmitting ? "Submitting..." : "Submit Contribution"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-full bg-transparent"
                        onClick={() => {
                          setSelectedArticle(null)
                          setContribution("")
                          setContributionAmount("")
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mockContributionArticles.map((article) => (
                  <Card
                    key={article.id}
                    className="glass rounded-2xl border-white/20 cursor-pointer transition-all hover:shadow-lg hover:ring-2 hover:ring-primary/50"
                    onClick={() => setSelectedArticle(article)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-base line-clamp-2 flex-1">{article.title}</CardTitle>
                        <Badge
                          variant={
                            article.status === "published"
                              ? "default"
                              : article.status === "under-review"
                                ? "secondary"
                                : "outline"
                          }
                          className="text-xs rounded-full flex-shrink-0"
                        >
                          {article.status}
                        </Badge>
                      </div>
                      <CardDescription className="text-xs">{article.contributions} contributions</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-2">{article.summary}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            {showBadge && address && (
              <NFTBadge walletAddress={address} contributionAmount={contributionAmount || "0"} />
            )}

            {selectedArticle && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground">Other Articles</h3>
                  <Badge variant="outline" className="rounded-full">
                    {mockContributionArticles.length - 1}
                  </Badge>
                </div>

                {mockContributionArticles
                  .filter((article) => article.id !== selectedArticle.id)
                  .map((article) => (
                    <Card
                      key={article.id}
                      className="glass rounded-2xl border-white/20 cursor-pointer transition-all hover:shadow-lg"
                      onClick={() => setSelectedArticle(article)}
                    >
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base line-clamp-2">{article.title}</CardTitle>
                        <CardDescription className="text-xs">{article.contributions} contributions</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Badge
                          variant={
                            article.status === "published"
                              ? "default"
                              : article.status === "under-review"
                                ? "secondary"
                                : "outline"
                          }
                          className="text-xs rounded-full"
                        >
                          {article.status}
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
              </>
            )}

            {!selectedArticle && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground">Available Articles</h3>
                  <Badge variant="outline" className="rounded-full">
                    {mockContributionArticles.length}
                  </Badge>
                </div>

                <Button className="w-full rounded-full gap-2 bg-primary text-primary-foreground hover:opacity-90">
                  <Plus className="w-4 h-4" />
                  Create New Article
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
