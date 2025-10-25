"use client"

import { notFound } from "next/navigation"
import Link from "next/link"
import { MarkdownRenderer } from "@/components/markdown-renderer"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import { abi, address } from "@/lib/abi"
import { shortenAddress } from "@/lib/utils"
import { useEffect, useState } from "react"
import { createPublicClient, http } from "viem"
import { hederaTestnet } from "@/lib/wagmi"
import { EditHistoryPanel } from "@/components/edit-history-panel"

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

interface ArticleClientProps {
  id: string
}

export default function ArticleClient({ id }: ArticleClientProps) {
  const [article, setArticle] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchArticleAndHistory = async () => {
      try {
        const publicClient = createPublicClient({
          chain: hederaTestnet,
          transport: http(),
        })

        // 1. Fetch the proposal to get the pageId
        const proposal = (await publicClient.readContract({
          address,
          abi,
          functionName: "proposalSummary",
          args: [BigInt(id)],
        })) as ProposalSummary

        if (!proposal) {
          return
        }

        const pageId = proposal[1]

        // 2. Fetch the latest page content using the pageId
        const page = (await publicClient.readContract({
          address,
          abi,
          functionName: "getPage",
          args: [pageId],
        })) as [string, boolean]

        if (!page || !page[1]) {
          // Page doesn't exist
          return
        }

        const latestCid = page[0]

        // 3. Fetch all ProposalCreated and Finalized events for history
        const fromBlock =
          (await publicClient.getBlockNumber()) > 200000n
            ? (await publicClient.getBlockNumber()) - 200000n
            : 0n
        const [proposalCreatedLogs, finalizedLogs] = await Promise.all([
          publicClient.getLogs({
            address,
            event: abi.find(
              (item) => item.type === "event" && item.name === "ProposalCreated",
            ),
            fromBlock,
          }),
          publicClient.getLogs({
            address,
            event: abi.find(
              (item) => item.type === "event" && item.name === "Finalized",
            ),
            fromBlock,
          }),
        ])

        // 4. Create a map of finalized and accepted proposals
        const acceptedProposals = new Set()
        finalizedLogs.forEach((log: any) => {
          if (log.args.accepted) {
            acceptedProposals.add(log.args.proposalId.toString())
          }
        })

        // 5. Filter for accepted edit proposals for this page
        const editHistoryPromises = proposalCreatedLogs
          .filter((log: any) => {
            const isEdit = log.args.kind === 1 // 1 is Edit enum
            const isForThisPage = log.args.pageId === pageId
            const isAccepted = acceptedProposals.has(log.args.id.toString())
            return isEdit && isForThisPage && isAccepted
          })
          .map(async (log: any) => {
            const res = await fetch(
              `https://gateway.lighthouse.storage/ipfs/${log.args.cid}`,
            )
            const versionData = await res.json()
            return {
              id: log.args.id.toString(),
              changeDescription:
                versionData.changeDescription || "Version update",
              createdBy: log.args.proposer,
              createdAt: new Date(Number(log.args.startTime) * 1000),
              content: versionData.content,
            }
          })

        const versions = await Promise.all(editHistoryPromises)

        // 6. Fetch current article content from the latest CID
        const res = await fetch(
          `https://gateway.lighthouse.storage/ipfs/${latestCid}`,
        )
        const articleData = await res.json()

        setArticle({
          id: proposal[0].toString(),
          slug: proposal[0].toString(),
          title: articleData.title,
          summary: articleData.summary,
          content: articleData.content,
          status: proposal[11] ? "published" : "under-review",
          createdBy: proposal[3],
          versions: versions.sort(
            (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
          ),
          reviewers: [], // Placeholder
          updatedAt: new Date(), // Placeholder
        })
      } catch (error) {
        console.error("Failed to fetch article and history:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      fetchArticleAndHistory()
    }
  }, [id])

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!article) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-foreground">{article.title}</h1>
          <p className="text-muted-foreground mt-2">{article.summary}</p>
          <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
            <span>By {shortenAddress(article.createdBy)}</span>
            <span>•</span>
            <span>Updated {article.updatedAt.toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <MarkdownRenderer content={article.content} />
          </div>
          <div className="lg:col-span-1">
            <EditHistoryPanel article={article} />
          </div>
        </div>
      </div>
    </main>
  )
}
