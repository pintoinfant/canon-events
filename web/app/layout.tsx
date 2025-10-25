import type React from "react"
import type { Metadata } from "next"

import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Geist, Geist_Mono, Geist as V0_Font_Geist, Geist_Mono as V0_Font_Geist_Mono, Cormorant as V0_Font_Cormorant } from 'next/font/google'
import { Providers } from "@/components/providers"

// Initialize fonts
const _geist = V0_Font_Geist({ subsets: ['latin'], weight: ["100","200","300","400","500","600","700","800","900"] })
const _geistMono = V0_Font_Geist_Mono({ subsets: ['latin'], weight: ["100","200","300","400","500","600","700","800","900"] })
const _cormorant = V0_Font_Cormorant({ subsets: ['latin'], weight: ["300","400","500","600","700"] })

const _geistSans = Geist({ subsets: ["latin"] })
export const metadata: Metadata = {
  title: "Canon Event - Web3 Knowledge Platform",
  description: "A Wikipedia-like Web3 knowledge platform",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-serif antialiased`}>
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  )
}
