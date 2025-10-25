import type { Article, Contributor, ReviewTask } from "./types"

export const mockArticles: Article[] = [
  {
    id: "1",
    slug: "blockchain-fundamentals",
    title: "Blockchain Fundamentals",
    summary: "Understanding the core concepts of blockchain technology",
    content: `# Blockchain Fundamentals

Blockchain is a distributed ledger technology that enables secure, transparent, and decentralized record-keeping. 

## Key Concepts

### Decentralization
Blockchain operates without a central authority, with data distributed across multiple nodes.

### Immutability
Once data is recorded on the blockchain, it becomes extremely difficult to alter or delete.

### Transparency
All transactions are visible to network participants, ensuring accountability.

## How It Works

1. A transaction is initiated
2. The transaction is broadcast to the network
3. Network nodes validate the transaction
4. The transaction is added to a block
5. The block is added to the chain

## Applications

- Cryptocurrency
- Smart Contracts
- Supply Chain Management
- Digital Identity`,
    imageUrl: "/blockchain-network.jpg",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-20"),
    createdBy: "Alice Chen",
    status: "published",
    versions: [
      {
        id: "v1",
        articleId: "1",
        title: "Blockchain Fundamentals",
        content: "Initial version of blockchain fundamentals",
        createdAt: new Date("2024-01-15"),
        createdBy: "Alice Chen",
        changeDescription: "Initial creation",
      },
      {
        id: "v2",
        articleId: "1",
        title: "Blockchain Fundamentals",
        content: "Added applications section",
        createdAt: new Date("2024-01-20"),
        createdBy: "Bob Smith",
        changeDescription: "Added applications section with real-world use cases",
      },
    ],
    reviewers: [
      {
        id: "r1",
        name: "Carol Davis",
        email: "carol@example.com",
        status: "approved",
        feedback: "Great comprehensive overview",
        reviewedAt: new Date("2024-01-18"),
      },
    ],
  },
  {
    id: "2",
    slug: "smart-contracts-guide",
    title: "Smart Contracts Guide",
    summary: "A comprehensive guide to understanding and writing smart contracts",
    content: `# Smart Contracts Guide

Smart contracts are self-executing contracts with terms written in code.

## What are Smart Contracts?

Smart contracts are programs that automatically execute when conditions are met.

## Benefits

- Automation
- Transparency
- Security
- Cost Efficiency`,
    imageUrl: "/smart-contracts.jpg",
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-10"),
    createdBy: "Bob Smith",
    status: "published",
    versions: [
      {
        id: "v3",
        articleId: "2",
        title: "Smart Contracts Guide",
        content: "Initial version",
        createdAt: new Date("2024-01-10"),
        createdBy: "Bob Smith",
        changeDescription: "Initial creation",
      },
    ],
    reviewers: [],
  },
  {
    id: "3",
    slug: "defi-explained",
    title: "DeFi Explained",
    summary: "Understanding Decentralized Finance",
    content: `# DeFi Explained

Decentralized Finance (DeFi) refers to financial services built on blockchain networks.

## Core Components

- Lending Protocols
- Decentralized Exchanges
- Staking
- Yield Farming`,
    imageUrl: "/defi-finance.jpg",
    createdAt: new Date("2024-01-05"),
    updatedAt: new Date("2024-01-05"),
    createdBy: "Alice Chen",
    status: "under-review",
    versions: [
      {
        id: "v4",
        articleId: "3",
        title: "DeFi Explained",
        content: "Initial version",
        createdAt: new Date("2024-01-05"),
        createdBy: "Alice Chen",
        changeDescription: "Initial creation",
      },
    ],
    reviewers: [
      {
        id: "r2",
        name: "David Wilson",
        email: "david@example.com",
        status: "pending",
      },
    ],
  },
]

export const mockContributors: Contributor[] = [
  {
    id: "c1",
    name: "Alice Chen",
    email: "alice@example.com",
    avatar: "/avatar-alice.jpg",
    bio: "Blockchain researcher and educator",
    articlesCount: 5,
    joinedAt: new Date("2023-06-01"),
    contributions: [
      {
        articleId: "1",
        articleTitle: "Blockchain Fundamentals",
        type: "created",
        date: new Date("2024-01-15"),
      },
      {
        articleId: "3",
        articleTitle: "DeFi Explained",
        type: "created",
        date: new Date("2024-01-05"),
      },
    ],
  },
  {
    id: "c2",
    name: "Bob Smith",
    email: "bob@example.com",
    avatar: "/avatar-bob.jpg",
    bio: "Smart contract developer",
    articlesCount: 3,
    joinedAt: new Date("2023-08-15"),
    contributions: [
      {
        articleId: "2",
        articleTitle: "Smart Contracts Guide",
        type: "created",
        date: new Date("2024-01-10"),
      },
      {
        articleId: "1",
        articleTitle: "Blockchain Fundamentals",
        type: "edited",
        date: new Date("2024-01-20"),
      },
    ],
  },
  {
    id: "c3",
    name: "Carol Davis",
    email: "carol@example.com",
    avatar: "/avatar-carol.jpg",
    bio: "DeFi specialist and reviewer",
    articlesCount: 2,
    joinedAt: new Date("2023-09-01"),
    contributions: [],
  },
]

export const mockReviewTasks: ReviewTask[] = [
  {
    id: "rt1",
    articleId: "3",
    articleTitle: "DeFi Explained",
    submittedBy: "Alice Chen",
    submittedAt: new Date("2024-01-05"),
    status: "pending",
  },
  {
    id: "rt2",
    articleId: "1",
    articleTitle: "Blockchain Fundamentals",
    submittedBy: "Alice Chen",
    submittedAt: new Date("2024-01-15"),
    status: "approved",
    feedback: "Excellent comprehensive overview of blockchain concepts",
  },
]
