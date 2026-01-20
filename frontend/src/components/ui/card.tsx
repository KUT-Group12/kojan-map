import * as React from 'react';

import { cn } from './utils';

/**
 * Renders a card container div with the component's default styling and accepts additional attributes.
 *
 * @param className - Additional CSS classes to append to the card's default class list
 * @param props - Other HTML attributes and event handlers to spread onto the underlying div
 * @returns The card container element (a styled div with `data-slot="card"`)
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
 * Renders the card header container with preset layout, spacing, and responsive grid classes.
 *
 * @param className - Additional CSS class names to merge with the component's default classes
 * @param props - Additional props to spread onto the root `div` (e.g., event handlers, id, data attributes)
 * @returns The header `div` element for a Card, marked with `data-slot="card-header"`
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
 * Renders the card title as an `h4` element with the `data-slot="card-title"` attribute.
 *
 * @param className - Additional CSS classes to append to the default `leading-none` class
 * @param props - Additional props are spread onto the underlying `h4` element
 * @returns The rendered `h4` element used as the card title
 */
function CardTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return <h4 data-slot="card-title" className={cn('leading-none', className)} {...props} />;
}

/**
 * Renders a paragraph element for the card description slot with muted foreground styling.
 *
 * Accepts standard HTML props; `className` is merged with the component's default styling.
 *
 * @returns The paragraph element representing the card description.
 */
function CardDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <p data-slot="card-description" className={cn('text-muted-foreground', className)} {...props} />
  );
}

/**
 * Renders the card action slot positioned within the card's grid layout.
 *
 * @param className - Additional CSS classes appended to the component's computed class list
 * @returns The div element for the card action slot with grid placement and alignment classes applied
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
 * Renders the card's content container.
 *
 * Merges default horizontal padding and last-child bottom padding with any provided `className` and spreads remaining props onto the underlying div.
 *
 * @returns A div element with `data-slot="card-content"`, horizontal padding (`px-6`), bottom padding on the last child (`[&:last-child]:pb-6`), and any additional classes and props applied.
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
 * Renders the footer area of a card component.
 *
 * @param className - Additional CSS classes to merge with the footer's default styling
 * @param props - Additional HTML attributes and event handlers forwarded to the footer `div`
 * @returns The rendered card footer element with composed styling and forwarded props
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