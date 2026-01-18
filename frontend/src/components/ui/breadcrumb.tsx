import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { ChevronRight, MoreHorizontal } from 'lucide-react';

import { cn } from './utils';

/**
 * Renders a breadcrumb navigation container.
 *
 * @param props - Props forwarded to the underlying `<nav>` element.
 * @returns A `<nav>` element with `aria-label="breadcrumb"`, `data-slot="breadcrumb"`, and any provided props applied.
 */
function Breadcrumb({ ...props }: React.ComponentProps<'nav'>) {
  return <nav aria-label="breadcrumb" data-slot="breadcrumb" {...props} />;
}

/**
 * Render an ordered list element used to group breadcrumb items with default styling.
 *
 * @param className - Additional CSS class names to append to the component's default styles
 * @returns The rendered `<ol>` element configured as a breadcrumb list
 */
function BreadcrumbList({ className, ...props }: React.ComponentProps<'ol'>) {
  return (
    <ol
      data-slot="breadcrumb-list"
      className={cn(
        'text-muted-foreground flex flex-wrap items-center gap-1.5 text-sm break-words sm:gap-2.5',
        className
      )}
      {...props}
    />
  );
}

/**
 * Renders a list item used as a breadcrumb item.
 *
 * @param className - Additional CSS class names appended to the default `inline-flex items-center gap-1.5` classes.
 * @param props - Remaining props are spread onto the `<li>` element.
 * @returns The `<li>` element with `data-slot="breadcrumb-item"` and merged class names.
 */
function BreadcrumbItem({ className, ...props }: React.ComponentProps<'li'>) {
  return (
    <li
      data-slot="breadcrumb-item"
      className={cn('inline-flex items-center gap-1.5', className)}
      {...props}
    />
  );
}

/**
 * Renders a breadcrumb link element, using the child element as the rendered node when `asChild` is true.
 *
 * @param asChild - When true, use the provided child component as the rendered element instead of an anchor.
 * @param props - Remaining anchor props to pass through to the rendered element.
 * @returns A React element representing a breadcrumb link.
 */
function BreadcrumbLink({
  asChild,
  className,
  ...props
}: React.ComponentProps<'a'> & {
  asChild?: boolean;
}) {
  const Comp = asChild ? Slot : 'a';

  return (
    <Comp
      data-slot="breadcrumb-link"
      className={cn('hover:text-foreground transition-colors', className)}
      {...props}
    />
  );
}

/**
 * Renders the current breadcrumb page as a non-interactive, accessible page indicator.
 *
 * The element is a <span> marked with data-slot="breadcrumb-page", role="link", aria-disabled="true",
 * and aria-current="page". Provided class names are merged with the component's default styling.
 *
 * @param className - Additional CSS class names to apply to the element.
 * @returns A span element representing the current page in the breadcrumb, marked as disabled and current.
 */
function BreadcrumbPage({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="breadcrumb-page"
      role="link"
      aria-disabled="true"
      aria-current="page"
      className={cn('text-foreground font-normal', className)}
      {...props}
    />
  );
}

/**
 * Renders a breadcrumb separator list item that shows the provided content or a right chevron icon.
 *
 * The element is marked with role="presentation", aria-hidden="true", and data-slot="breadcrumb-separator".
 *
 * @param children - Optional content to display inside the separator; defaults to a right-chevron icon when omitted
 * @param className - Additional class names applied to the list item
 * @returns A `<li>` element used as the visual separator between breadcrumb items
 */
function BreadcrumbSeparator({ children, className, ...props }: React.ComponentProps<'li'>) {
  return (
    <li
      data-slot="breadcrumb-separator"
      role="presentation"
      aria-hidden="true"
      className={cn('[&>svg]:size-3.5', className)}
      {...props}
    >
      {children ?? <ChevronRight />}
    </li>
  );
}

/**
 * Renders a presentation-only ellipsis used in breadcrumb trails to indicate collapsed items.
 *
 * The element is marked as presentation and hidden from assistive technologies; visual content is provided for sighted users.
 *
 * @param className - Optional additional class names to apply to the root span
 * @returns The breadcrumb ellipsis element
 */
function BreadcrumbEllipsis({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="breadcrumb-ellipsis"
      role="presentation"
      aria-hidden="true"
      className={cn('flex size-9 items-center justify-center', className)}
      {...props}
    >
      <MoreHorizontal className="size-4" />
      <span className="sr-only">More</span>
    </span>
  );
}

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
};