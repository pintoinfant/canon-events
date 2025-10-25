import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function shortenAddress(
  addr?: string,
  opts: { start?: number; end?: number } = {}
) {
  if (!addr) return ''
  // If already short or not a hex address pattern, just return as-is
  if (addr.length <= 10) return addr
  const { start = 6, end = 4 } = opts
  return `${addr.slice(0, start)}...${addr.slice(-end)}`
}
