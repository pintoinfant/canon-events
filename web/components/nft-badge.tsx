"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface NFTBadgeProps {
  walletAddress: string
  contributionAmount?: string
}

export function NFTBadge({ walletAddress, contributionAmount }: NFTBadgeProps) {
  return (
    <Card className="glass rounded-2xl border-white/20 bg-gradient-to-br from-blue-50/50 to-purple-50/50">
      <CardHeader className="text-center pb-3">
        <CardTitle className="text-lg">Contributor Badge</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-3xl font-bold">
            ✓
          </div>
        </div>
        <div className="text-center space-y-2">
          <p className="text-sm font-medium text-foreground">You are a Contributor</p>
          <p className="text-xs text-muted-foreground">NFT Badge Minted</p>
          {contributionAmount && (
            <p className="text-xs font-semibold text-primary">Contributed: {contributionAmount} ETH</p>
          )}
          <p className="text-xs text-muted-foreground break-all">{walletAddress}</p>
        </div>
        <div className="pt-2 border-t border-white/20">
          <p className="text-xs text-center text-muted-foreground">This badge is stored as an NFT on your wallet</p>
        </div>
      </CardContent>
    </Card>
  )
}
