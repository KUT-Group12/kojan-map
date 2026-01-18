import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Compose and merge Tailwind CSS class names from mixed inputs.
 *
 * Accepts any number of class-value inputs (strings, arrays, objects, or falsy values) which are normalized and combined into a single class string.
 *
 * @param inputs - One or more class values to include in the result
 * @returns The final merged class string with Tailwind-style class conflicts resolved and duplicates deduplicated
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}