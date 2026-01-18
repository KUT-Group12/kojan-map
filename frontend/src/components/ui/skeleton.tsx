import { cn } from './utils';

/**
 * Renders a skeleton placeholder div with default pulse styling.
 *
 * The element has `data-slot="skeleton"` and merges the provided `className` with the default classes `bg-accent animate-pulse rounded-md`.
 *
 * @param className - Additional class names appended to the default skeleton classes.
 * @returns A div element styled as a skeleton placeholder.
 */
function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      className={cn('bg-accent animate-pulse rounded-md', className)}
      {...props}
    />
  );
}

export { Skeleton };