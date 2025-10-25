"use client"

import { useState } from "react"
import Link from "next/link"
import type { Article } from "@/lib/types"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash2, Edit } from "lucide-react"
import { shortenAddress } from "@/lib/utils"

interface AdminArticleTableProps {
  articles: Article[]
  onDelete: (articleId: string) => void
}

export function AdminArticleTable({ articles, onDelete }: AdminArticleTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (articleId: string) => {
    setDeletingId(articleId)
    await new Promise((resolve) => setTimeout(resolve, 500))
    onDelete(articleId)
    setDeletingId(null)
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Author</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Versions</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {articles.map((article) => (
            <TableRow key={article.id}>
              <TableCell className="font-medium max-w-xs truncate">{article.title}</TableCell>
              <TableCell>{shortenAddress(article.createdBy)}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    article.status === "published"
                      ? "default"
                      : article.status === "under-review"
                        ? "secondary"
                        : "outline"
                  }
                >
                  {article.status}
                </Badge>
              </TableCell>
              <TableCell>{article.versions.length}</TableCell>
              <TableCell className="text-sm text-muted-foreground">{article.createdAt.toLocaleDateString()}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Link href={`/article/${article.slug}/edit`}>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/contribute">
                    <Button variant="ghost" size="sm" title="Contribute to this article">
                      <span className="text-xs">Contribute</span>
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(article.id)}
                    disabled={deletingId === article.id}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
