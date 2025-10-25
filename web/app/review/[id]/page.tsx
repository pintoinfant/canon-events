"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useReadContract, useWriteContract } from "wagmi"
import { readContract } from "wagmi/actions"
import { config } from "@/lib/wagmi"
import { parseEther, formatEther } from "viem"
import { abi, address } from "@/lib/abi"
import { DiffViewer } from "@/components/diff-viewer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ThumbsUp, ThumbsDown, ChevronLeft } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface ProposalDetails {
  title: string
  summary: string
  content: string
  changeDescription: string
}

export default function ReviewProposalPage() {
  const { id } = useParams()
  const router = useRouter()
  const [stakeAmount, setStakeAmount] = useState("1")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [proposalDetails, setProposalDetails] = useState<ProposalDetails | null>(null)
  const [originalContent, setOriginalContent] = useState<string | null>(null)

  const { writeContractAsync } = useWriteContract()

  const { data: proposal, isLoading: isLoadingProposal } = useReadContract({
    address,
    abi,
    functionName: "proposals",
    args: [BigInt(id as string)],
    query: { enabled: !!id },
  })

  useEffect(() => {
    const fetchContent = async () => {
      if (proposal) {
        // 1. Fetch the new content from the proposal's IPFS hash
        const proposalIpfsHash = (proposal as any)[4]
        const proposalRes = await fetch(`https://gateway.lighthouse.storage/ipfs/${proposalIpfsHash}`)
        const proposalData = await proposalRes.json()
        setProposalDetails(proposalData)

        // 2. Fetch the original content
        const pageId = (proposal as any)[1]
        if (pageId === 0n) {
          setOriginalContent("")
          return
        }

        const originalPageData = await readContract(config, {
          address,
          abi,
          functionName: "pages",
          args: [pageId],
        })

        const originalIpfsHash = originalPageData[0]
        if (originalIpfsHash) {
          const originalRes = await fetch(`https://gateway.lighthouse.storage/ipfs/${originalIpfsHash}`)
          const originalData = await originalRes.json()
          setOriginalContent(originalData.content)
        } else {
          setOriginalContent("")
        }
      }
    }
    fetchContent()
  }, [proposal])

  const handleVote = async (voteType: "approve" | "reject") => {
    setIsSubmitting(true)
    try {
      await writeContractAsync({
        address,
        abi,
        functionName: "stakeAndVote",
        args: [BigInt(id as string), voteType === "approve" ? 1 : 2],
        value: parseEther(stakeAmount),
      })
      router.push("/review")
    } catch (error) {
      console.error("Failed to vote:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isLoading = isLoadingProposal || !proposalDetails || originalContent === null

  return (
    <div className="container mx-auto py-10">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ChevronLeft className="h-4 w-4 mr-2" />
        Back to Reviews
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{proposalDetails?.title || <Skeleton className="h-8 w-3/4" />}</CardTitle>
              <CardDescription>{proposalDetails?.summary || <Skeleton className="h-4 w-full mt-2" />}</CardDescription>
            </CardHeader>
            <CardContent>
              <h3 className="font-semibold mb-2 text-lg">Proposed Changes</h3>
              <p className="text-muted-foreground mb-4">{proposalDetails?.changeDescription || <Skeleton className="h-4 w-1/2" />}</p>
              <div className="border rounded-md p-4 bg-muted/20">
                {isLoading ? (
                  <Skeleton className="h-64 w-full" />
                ) : (
                  <DiffViewer oldContent={originalContent!} newContent={proposalDetails!.content} />
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cast Your Vote</CardTitle>
              <CardDescription>Stake HBAR to approve or reject this proposal.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Stake Amount (HBAR)</label>
                <Input
                  type="number"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  placeholder="e.g., 10"
                  disabled={isSubmitting}
                />
              </div>
              <div className="flex flex-col gap-3">
                <Button
                  className="w-full"
                  onClick={() => handleVote("approve")}
                  disabled={isSubmitting || isLoading}
                >
                  <ThumbsUp className="h-4 w-4 mr-2" />
                  {isSubmitting ? "Approving..." : "Approve"}
                </Button>
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => handleVote("reject")}
                  disabled={isSubmitting || isLoading}
                >
                  <ThumbsDown className="h-4 w-4 mr-2" />
                  {isSubmitting ? "Rejecting..." : "Reject"}
                </Button>
              </div>
            </CardContent>
          </Card>
          {proposal && (
            <Card>
              <CardHeader>
                <CardTitle>Current Votes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-green-500 font-medium">Approve</span>
                  <span>{formatEther((proposal as any)[8])} HBAR</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-500 font-medium">Reject</span>
                  <span>{formatEther((proposal as any)[9])} HBAR</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}