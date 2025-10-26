"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useReadContract, useReadContracts, useSendTransaction } from "wagmi"
import { abi, address } from "@/lib/abi"
import { parseEther, parseUnits } from "viem"
import { useAccount } from "wagmi"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"
import { NFTBadge } from "@/components/nft-badge"
import { ArrowLeft } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

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

interface Article {
  id: string
  slug: string
  title: string
  summary: string
  author: `0x${string}`
}

export default function ContributePage() {
  const { isConnected } = useAccount()
  const { toast } = useToast()
  const [articles, setArticles] = useState<Article[]>([])
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  const [message, setMessage] = useState("")
  const [amount, setAmount] = useState("1")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showBadge, setShowBadge] = useState(false)

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
    query: { enabled: !!proposalCount },
  })

  const { sendTransactionAsync } = useSendTransaction()

  useEffect(() => {
    const fetchArticles = async () => {
      if (proposalSummariesData) {
        const acceptedProposals = proposalSummariesData
          .map((p) => p.result as ProposalSummary | undefined)
          .filter((p): p is ProposalSummary => !!p && p[11] && p[2] === 0)

        const articlePromises = acceptedProposals.map(async (p) => {
          const res = await fetch(`https://gateway.lighthouse.storage/ipfs/${p[4]}`)
          const articleData = await res.json()
          return {
            id: p[0].toString(),
            slug: p[0].toString(),
            title: articleData.title,
            summary: articleData.summary,
            author: p[3],
          }
        })
        const fetchedArticles = await Promise.all(articlePromises)
        setArticles(fetchedArticles.filter((a) => a).reverse())
      }
    }
    fetchArticles()
  }, [proposalSummariesData])

  const handleSend = async () => {
    if (!selectedArticle) return
    setIsSubmitting(true)
    try {
      const valueInTinybars = BigInt(parseEther(amount).toString())
      await sendTransactionAsync({
        to: selectedArticle.author,
        value: valueInTinybars,
      })

      toast({
        title: "Contribution Sent!",
        description: `You successfully sent ${amount} HBAR to the creator.`,
      })
      setShowBadge(true)
      setSelectedArticle(null)
    } catch (error) {
      console.error("Contribution failed:", error)
      toast({
        title: "Contribution Failed",
        description: "There was an error sending your contribution.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

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
        <Link href="/" className="flex items-center gap-2 text-primary hover:underline mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        <h1 className="text-4xl font-bold tracking-tight text-center mb-2 font-sans">Support a Creator</h1>
        <p className="text-muted-foreground text-center mb-12">Show your appreciation by sending HBAR to article creators.</p>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <Card
              key={article.id}
              className="glass hover:border-primary transition-colors cursor-pointer"
              onClick={() => setSelectedArticle(article)}
            >
              <CardHeader>
                <CardTitle className="font-sans">{article.title}</CardTitle>
                <CardDescription className="font-sans">{article.summary}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        {showBadge && <NFTBadge walletAddress={selectedArticle?.author || ""} contributionAmount={amount} />}
      </div>

      <Dialog open={!!selectedArticle} onOpenChange={() => setSelectedArticle(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Support the creator of "{selectedArticle?.title}"</DialogTitle>
            <DialogDescription>
              Send a message and some HBAR to show your appreciation. This is a great way to support the creators you love.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Message (Optional)</label>
              <Textarea
                placeholder="Say thanks or leave a comment..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Amount (HBAR)</label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g., 10"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedArticle(null)}>
              Cancel
            </Button>
            <Button onClick={handleSend} disabled={isSubmitting}>
              {isSubmitting ? <Spinner className="h-4 w-4" /> : `Send ${amount} HBAR`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}
