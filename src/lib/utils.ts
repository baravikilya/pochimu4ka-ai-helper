import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utility function to generate URL-friendly slug from question
export function generateSlug(question: string): string {
  return question
    .toLowerCase()
    .replace(/[^\u0400-\u04FF\w\s-]/g, '') // Keep Cyrillic, Latin, numbers, spaces, hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
    .substring(0, 100); // Limit length
}

// Utility function to generate meta description from answer
export function generateMetaDescription(answer: string): string {
  // Take first sentence or first 155 characters
  const firstSentence = answer.split('.')[0];
  if (firstSentence.length <= 155) {
    return firstSentence + '.';
  }
  return answer.substring(0, 155).trim() + '...';
}
