"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { mockArticles } from "@/lib/mock-data";
import { Input } from "@/components/ui/input";

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<typeof mockArticles>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim()) {
      const filtered = mockArticles.filter(
        (article) =>
          article.title.toLowerCase().includes(query.toLowerCase()) ||
          article.summary.toLowerCase().includes(query.toLowerCase())
      );
      setSuggestions(filtered);
      setIsOpen(true);
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
  }, [query]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl mx-auto">
      <div className="glass-strong rounded-full overflow-hidden flex items-center">
        <Input
          type="text"
          placeholder="Search articles..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query && setIsOpen(true)}
          className="flex-1 py-4 px-6 text-base border-0 bg-transparent focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:border-transparent font-sans placeholder:text-muted-foreground"
        />
        <button className="px-6 py-4 bg-primary text-primary-foreground hover:opacity-90 transition-opacity border-0 flex items-center justify-center">
          <Search className="h-5 w-5" />
        </button>
      </div>

      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-3 glass rounded-2xl shadow-xl z-50 overflow-hidden">
          {suggestions.map((article) => (
            <Link
              key={article.id}
              href={`/article/${article.slug}`}
              onClick={() => {
                setQuery("");
                setIsOpen(false);
              }}
              className="block px-4 py-3 hover:bg-white/30 border-b border-white/10 last:border-b-0 transition-colors font-sans"
            >
              <div className="font-medium text-foreground text-sm">
                {article.title}
              </div>
              <div className="text-xs text-muted-foreground line-clamp-1">
                {article.summary}
              </div>
            </Link>
          ))}
        </div>
      )}

      {isOpen && query && suggestions.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-3 glass rounded-2xl shadow-xl p-4 text-center text-muted-foreground text-sm font-sans">
          No articles found
        </div>
      )}
    </div>
  );
}
