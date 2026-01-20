import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from './utils';

const alertVariants = cva(
  'relative w-full rounded-lg border px-4 py-3 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current',
  {
    variants: {
      variant: {
        default: 'bg-card text-card-foreground',
        destructive:
          'text-destructive bg-card [&>svg]:text-current *:data-[slot=alert-description]:text-destructive/90',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

/**
 * Renders an alert container element with styles selected by `variant`.
 *
 * @param className - Additional CSS classes to append to the alert container
 * @param variant - Style variant to apply; uses the configured alertVariants (e.g., "default" or "destructive")
 * @param props - Additional attributes and event handlers applied to the underlying `div`
 * @returns A `div` element with `role="alert"`, `data-slot="alert"`, and composed classes for the selected variant
 */
function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}

/**
 * Renders the alert title container used by Alert.
 *
 * Forwards standard div attributes to the underlying element and appends `className` to the component's default title classes.
 *
 * @returns The alert title element.
 */
function AlertTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-title"
      className={cn('col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight', className)}
      {...props}
    />
  );
}

/**
 * Renders the alert's descriptive content container.
 *
 * @param className - Additional class names to append to the component's default styling
 * @param props - Additional HTML attributes passed through to the underlying `div`
 * @returns The rendered alert description element
 */
function AlertDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        'text-muted-foreground col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed',
        className
      )}
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertDescription };