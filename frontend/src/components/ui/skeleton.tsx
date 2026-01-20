import { cn } from './utils';

/**
 * Renders a pulsing rectangular skeleton placeholder.
 *
 * @param className - Additional class names to apply to the root div
 * @param props - Additional props to spread onto the root div
 * @returns A div element styled as a skeleton placeholder
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