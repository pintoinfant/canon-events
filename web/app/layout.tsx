import type React from "react"
import type { Metadata } from "next"

import { Analytics } from "@vercel/analytics/next"
import { Providers } from "@/components/providers"
import "./globals.css"

import {
  Geist,
  Geist_Mono as V0_Font_Geist_Mono,
  DM_Sans as V0_Font_DM_Sans,
  Abril_Fatface as V0_Font_Abril_Fatface,
} from "next/font/google"

// Initialize fonts
const _dmSans = V0_Font_DM_Sans({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900", "1000"],
})
const _geistMono = V0_Font_Geist_Mono({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
})
const _abrilFatface = V0_Font_Abril_Fatface({ subsets: ["latin"], weight: ["400"] })
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
      <body className={`font-sans antialiased`}>
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  )
}
