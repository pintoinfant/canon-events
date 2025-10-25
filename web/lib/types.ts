// Core types for Canon Event platform

export interface Article {
  id: string
  pageId: string
  slug: string
  title: string
  content: string
  summary: string
  imageUrl?: string
  createdAt: Date
  updatedAt: Date
  createdBy: string
  status: "draft" | "published" | "under-review"
  versions: ArticleVersion[]
  reviewers: Reviewer[]
}

export interface ArticleVersion {
  id: string
  articleId: string
  content: string
  title: string
  createdAt: Date
  createdBy: string
  changeDescription: string
}

export interface Reviewer {
  id: string
  name: string
  email: string
  status: "pending" | "approved" | "rejected"
  feedback?: string
  reviewedAt?: Date
}

export interface Contributor {
  id: string
  name: string
  email: string
  avatar?: string
  bio?: string
  articlesCount: number
  joinedAt: Date
  contributions: ContributionRecord[]
}

export interface ContributionRecord {
  articleId: string
  articleTitle: string
  type: "created" | "edited"
  date: Date
}

export interface ReviewTask {
  id: string
  articleId: string
  articleTitle: string
  submittedBy: string
  submittedAt: Date
  status: "pending" | "approved" | "rejected"
  feedback?: string
}
