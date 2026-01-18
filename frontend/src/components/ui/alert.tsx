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
 * Render a styled alert container with optional variant styling.
 *
 * @param className - Additional CSS classes to merge with the component's default classes
 * @param variant - Variant key determining the alert's visual style (e.g., "default", "destructive")
 * @param props - Additional `div` attributes and event handlers forwarded to the container
 * @returns A `div` element serving as the alert container with composed classes and forwarded props
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
 * Renders an alert title element used inside an Alert, applying layout, truncation, and font styles.
 *
 * @param className - Additional CSS classes to merge with the default title styles
 * @returns The rendered alert title element
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
 * Renders the alert description slot with preset styling.
 *
 * @param className - Additional class names to merge with the component's default styles.
 * @param props - Additional div props to apply to the root element.
 * @returns The alert description element.
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