"use client"

import Link from "next/link"
import type { Contributor } from "@/lib/types"
import { Table, TableBody, TableCell, TableHead, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface AdminContributorTableProps {
  contributors: Contributor[]
}

export function AdminContributorTable({ contributors }: AdminContributorTableProps) {
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <Table>
        <TableHead>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Articles</TableHead>
            <TableHead>Contributions</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHead>
        <TableBody>
          {contributors.map((contributor) => (
            <TableRow key={contributor.id}>
              <TableCell className="font-medium">{contributor.name}</TableCell>
              <TableCell className="text-sm text-muted-foreground">{contributor.email}</TableCell>
              <TableCell>
                <Badge variant="outline">{contributor.articlesCount}</Badge>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{contributor.contributions.length}</Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {contributor.joinedAt.toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right">
                <Link href={`/contributor/${contributor.id}`}>
                  <Button variant="ghost" size="sm">
                    View Profile
                  </Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
