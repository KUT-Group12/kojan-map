import * as React from 'react';

import { cn } from './utils';

/**
 * Card container component used to structure card layouts.
 *
 * @param className - Additional CSS classes to merge with the component's base styling
 * @param props - Other props are spread onto the root `div` (e.g., event handlers, id, style)
 * @returns A `div` element serving as the card container with base layout and visual styles
 */
function Card({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card"
      className={cn(
        'bg-card text-card-foreground flex flex-col gap-6 rounded-xl border',
        className
      )}
      {...props}
    />
  );
}

/**
 * Header region for a Card that renders a div with data-slot="card-header" and base header layout classes.
 *
 * @returns The rendered header div element with composed `className` and forwarded div props.
 */
function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        '@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 pt-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6',
        className
      )}
      {...props}
    />
  );
}

/**
 * Renders the card title as an h4 element with data-slot="card-title".
 *
 * @param className - Additional CSS class names to apply to the title.
 * @param props - Additional HTML attributes forwarded to the underlying h4 element.
 * @returns The rendered h4 element used as the card title.
 */
function CardTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return <h4 data-slot="card-title" className={cn('leading-none', className)} {...props} />;
}

/**
 * Renders the card's descriptive text element.
 *
 * @returns The rendered <p> element used for the card description, with muted foreground styling and any provided props and classes applied.
 */
function CardDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <p data-slot="card-description" className={cn('text-muted-foreground', className)} {...props} />
  );
}

/**
 * Renders the card action area positioned in the card layout.
 *
 * @returns A div element with `data-slot="card-action"` that is positioned at the end of its grid cell; accepts standard div props and merges any `className` with its base positioning classes.
 */
function CardAction({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-action"
      className={cn('col-start-2 row-span-2 row-start-1 self-start justify-self-end', className)}
      {...props}
    />
  );
}

/**
 * Renders the card's main content region.
 *
 * @param className - Additional CSS classes to merge with the component's base padding classes
 * @param props - Additional props are spread onto the root div
 * @returns A div element used as the card content container
 */
function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-content"
      className={cn('px-6 [&:last-child]:pb-6', className)}
      {...props}
    />
  );
}

/**
 * Footer region component for a card layout.
 *
 * Renders a div that serves as the card's footer and accepts standard div props.
 *
 * @param className - Additional CSS classes to apply to the root div
 * @returns A div element representing the card footer
 */
function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-footer"
      className={cn('flex items-center px-6 pb-6 [.border-t]:pt-6', className)}
      {...props}
    />
  );
}

export { Card, CardHeader, CardFooter, CardTitle, CardAction, CardDescription, CardContent };