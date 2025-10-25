import Link from "next/link"
import { SearchBar } from "@/components/search-bar"
import { mockArticles } from "@/lib/mock-data"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { WalletButton } from "@/components/wallet-button"
import Image from "next/image"

export default function Home() {
  const featuredArticles = mockArticles.slice(0, 3)

  return (
    <main className="min-h-screen bg-background">
      <section className="py-32 px-4 sm:px-6 lg:px-8 border-b border-border relative">
        <div className="absolute top-8 right-8">
          <WalletButton />
        </div>

        <div className="max-w-4xl mx-auto text-center px-[0]">
          <div className="flex justify-center mb-8">
            <Image
              src="/canon-logo-new.png"
              alt="Canon Event - An On-Chain Encyclopedia"
              width={400}
              height={500}
              className="w-64 h-80 sm:h-[505] sm:w-[322px]"
            />
          </div>

          <div className="mb-16">
            <SearchBar />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 text-center">
            <Link href="/create">
              <div className="glass rounded-2xl p-6 hover:scale-105 transition-transform cursor-pointer">
                <div className="flex justify-center mb-3">
                  <Image src="/creator.png" alt="Create" width={48} height={48} className="w-12 h-12" />
                </div>
                <div className="text-primary font-bold text-lg mb-1 font-sans tracking-tighter">Create Info</div>
                <div className="text-sm text-muted-foreground">Submit new articles</div>
              </div>
            </Link>
            <Link href="/review">
              <div className="glass rounded-2xl p-6 hover:scale-105 transition-transform cursor-pointer">
                <div className="flex justify-center mb-3">
                  <Image src="/review.png" alt="Review" width={48} height={48} className="w-12 h-12" />
                </div>
                <div className="text-primary font-sans font-bold text-lg mb-1 tracking-tighter">Review</div>
                <div className="text-sm text-muted-foreground">Vote on submissions</div>
              </div>
            </Link>
            <Link href="/contribute">
              <div className="glass rounded-2xl p-6 hover:scale-105 transition-transform cursor-pointer">
                <div className="flex justify-center mb-3">
                  <Image src="/contributor.png" alt="Contribute" width={48} height={48} className="w-12 h-12" />
                </div>
                <div className="text-primary font-sans font-bold text-lg mb-1 tracking-tighter">Contribute</div>
                <div className="text-sm text-muted-foreground">Improve articles</div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-sans font-bold text-foreground mb-12 text-center tracking-tighter">
            Featured Articles
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {featuredArticles.map((article) => (
              <div key={article.id}>
                <Link href={`/article/${article.slug}`}>
                  <Card className="h-full hover:shadow-lg transition-all cursor-pointer border-white/20 bg-white/20 glass rounded-2xl hover:scale-105">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <CardTitle className="line-clamp-2 text-lg font-sans tracking-tight">{article.title}</CardTitle>
                        <Badge
                          variant={
                            article.status === "published"
                              ? "default"
                              : article.status === "under-review"
                                ? "secondary"
                                : "outline"
                          }
                          className="text-xs rounded-full"
                        >
                          {article.status}
                        </Badge>
                      </div>
                      <CardDescription className="line-clamp-2 text-sm font-sans">{article.summary}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>By {article.createdBy}</span>
                        <span>{article.versions.length} versions</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link
              href="/articles"
              className="inline-block px-8 py-3 bg-primary text-primary-foreground rounded-full hover:opacity-90 transition-opacity font-sans font-medium text-base border border-primary"
            >
              Browse All Articles
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted border-t border-b border-border">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="glass rounded-2xl p-8 text-center hover:scale-105 transition-transform">
              <div className="text-4xl font-sans font-bold text-primary mb-2">{mockArticles.length}</div>
              <div className="text-muted-foreground font-sans">Articles</div>
            </div>
            <div className="glass rounded-2xl p-8 text-center hover:scale-105 transition-transform">
              <div className="text-4xl font-sans font-bold text-primary mb-2">
                {mockArticles.reduce((sum, a) => sum + a.versions.length, 0)}
              </div>
              <div className="text-muted-foreground font-sans">Total Versions</div>
            </div>
            <div className="glass rounded-2xl p-8 text-center hover:scale-105 transition-transform">
              <div className="text-4xl font-sans font-bold text-primary mb-2">
                {new Set(mockArticles.map((a) => a.createdBy)).size}
              </div>
              <div className="text-muted-foreground font-sans">Contributors</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
