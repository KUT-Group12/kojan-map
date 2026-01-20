import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Resolve and merge class value inputs into a single Tailwind-aware class string.
 *
 * @param inputs - Class values (strings, arrays, objects, or mixed) to combine
 * @returns The combined class string with Tailwind utility conflicts resolved and duplicates removed
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}