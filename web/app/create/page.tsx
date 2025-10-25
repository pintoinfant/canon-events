"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useWallet } from "@/lib/wallet-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, AlertCircle } from "lucide-react"
import { uploadJSONToIPFS } from "@/lib/lighthouse"
import { useWriteContract } from "wagmi"
import { parseEther } from "viem"
import { abi, address } from "@/lib/abi"

export default function CreatePage() {
  const { isConnected } = useWallet()
  const [title, setTitle] = useState("")
  const [summary, setSummary] = useState("")
  const [content, setContent] = useState("")
  const [stakeAmount, setStakeAmount] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [cid, setCid] = useState("")
  const { writeContractAsync } = useWriteContract()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isConnected || !title || !summary || !content || !stakeAmount) {
      alert("Please fill all fields and connect wallet")
      return
    }

    setIsSubmitting(true)
    try {
      const articleJSON = { title, summary, content }
      const newCid = await uploadJSONToIPFS(articleJSON)
      setCid(newCid)

      await writeContractAsync({
        abi,
        address,
        functionName: "proposeCreate",
        args: [newCid],
        value: parseEther(stakeAmount),
      })

      setSubmitted(true)
    } catch (error) {
      console.error(error)
      alert("An error occurred during submission.")
    } finally {
      setIsSubmitting(false)
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
                You need to connect your wallet to create and submit articles. Please connect your wallet to proceed.
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

  if (submitted) {
    return (
      <main className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-4 py-16">
          <Card className="glass rounded-2xl border-white/20">
            <CardHeader>
              <CardTitle className="text-green-600">Article Submitted Successfully!</CardTitle>
              <CardDescription>Your article has been submitted for review</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-800">
                    <strong>Article:</strong> {title}
                  </p>
                  <p className="text-sm text-green-800 mt-2">
                    <strong>Stake Amount:</strong> {stakeAmount} HBAR
                  </p>
                </div>
                <p className="text-muted-foreground">
                  Your article is now under review. Reviewers will vote on whether to approve or reject your submission.
                </p>
                <Link href="/">
                  <Button className="rounded-full w-full">Back to Home</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <Link href="/" className="flex items-center gap-2 text-primary hover:underline mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-sans font-bold text-foreground mb-2 tracking-tighter">Contribute by Sharing Knowledge</h1>
          <p className="text-muted-foreground">Propose a new article for the Canon platform. Your submission will be reviewed by the community.</p>
        </div>

        <Card className="glass rounded-2xl border-white/20">
          <CardHeader>
            <CardTitle>Article Details</CardTitle>
            <CardDescription>Fill in the information about your article</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Article Title</label>
                <Input
                  type="text"
                  placeholder="Enter article title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="rounded-lg glass-strong"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Summary</label>
                <Textarea
                  placeholder="Brief summary of your article"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="rounded-lg glass-strong min-h-24"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Full Content</label>
                <Textarea
                  placeholder="Write your article content here"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="rounded-lg glass-strong min-h-48"
                  required
                />
              </div>

              <div className="border-t border-border pt-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Stake HBAR</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Stake HBAR to submit your article. This demonstrates your confidence in the quality of your submission.
                </p>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Amount (HBAR)</label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="10"
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(e.target.value)}
                      step="1"
                      min="0"
                      className="rounded-lg glass-strong flex-1"
                      required
                    />
                    <span className="flex items-center px-4 py-2 bg-muted rounded-lg text-muted-foreground">HBAR</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-full flex-1 bg-primary text-primary-foreground hover:opacity-90"
                >
                  {isSubmitting ? "Submitting..." : "Submit Article"}
                </Button>
                <Link href="/" className="flex-1">
                  <Button variant="outline" className="rounded-full w-full bg-transparent">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
