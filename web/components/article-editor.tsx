"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { Article } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DiffViewer } from "@/components/diff-viewer"
import { MarkdownRenderer } from "@/components/markdown-renderer"
import { ChevronLeft } from "lucide-react"
import { useWriteContract } from "wagmi"
import { abi, address } from "@/lib/abi"
import { uploadJSONToIPFS } from "@/lib/lighthouse"
import { parseEther } from "viem"

interface ArticleEditorProps {
  article: Article
}

export function ArticleEditor({ article }: ArticleEditorProps) {
  const router = useRouter()
  const [title, setTitle] = useState(article.title)
  const [summary, setSummary] = useState(article.summary)
  const [content, setContent] = useState(article.content)
  const [changeDescription, setChangeDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [stakeAmount, setStakeAmount] = useState("1")
  const { writeContractAsync } = useWriteContract()

  const handleSave = async () => {
    setIsSubmitting(true)
    try {
      // 1. Upload to IPFS
      const Hash = await uploadJSONToIPFS({
        title,
        summary,
        content,
        changeDescription,
      })

      // 2. Propose edit on-chain
      await writeContractAsync({
        address,
        abi,
        functionName: "proposeEdit",
        args: [BigInt(article.pageId), Hash],
        value: parseEther(stakeAmount),
      })

      router.push(`/article/${article.id}`)
    } catch (error) {
      console.error("Failed to save article edit:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.back()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Edit Article</h1>
          <p className="text-muted-foreground mt-1">{article.title}</p>
        </div>
        <Button variant="ghost" onClick={handleCancel}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Cancel
        </Button>
      </div>

      {/* Editor Tabs */}
      <Tabs defaultValue="edit" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="edit">Edit</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="diff">Diff</TabsTrigger>
        </TabsList>

        {/* Edit Tab */}
        <TabsContent value="edit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Article Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Title</label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Article title" />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Summary</label>
                <Input value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Brief summary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Content</CardTitle>
              <CardDescription>Use Markdown formatting</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your article content here..."
                className="font-mono min-h-96"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Change Description</CardTitle>
              <CardDescription>Describe what you changed and why</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={changeDescription}
                onChange={(e) => setChangeDescription(e.target.value)}
                placeholder="e.g., Added new section on DeFi protocols"
                className="min-h-24"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Staking</CardTitle>
              <CardDescription>Set the amount of HBAR to stake for this proposal.</CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                type="number"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                placeholder="e.g., 10"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{title}</CardTitle>
              <CardDescription>{summary}</CardDescription>
            </CardHeader>
            <CardContent>
              <MarkdownRenderer content={content} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Diff Tab */}
        <TabsContent value="diff" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Changes</CardTitle>
              <CardDescription>What you changed from the original</CardDescription>
            </CardHeader>
            <CardContent>
              <DiffViewer oldContent={article.content} newContent={content} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-end">
        <Button variant="outline" onClick={handleCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  )
}
