import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { ChevronRight, MoreHorizontal } from 'lucide-react';

import { cn } from './utils';

/**
 * Renders a navigation container marked as a breadcrumb.
 *
 * @param props - Props spread onto the underlying <nav> element.
 * @returns A <nav> element with aria-label="breadcrumb" and data-slot="breadcrumb".
 */
function Breadcrumb({ ...props }: React.ComponentProps<'nav'>) {
  return <nav aria-label="breadcrumb" data-slot="breadcrumb" {...props} />;
}

/**
 * Renders an ordered list to contain breadcrumb items.
 *
 * @param className - Additional CSS classes appended to the component's default classes
 * @returns The ordered list element with `data-slot="breadcrumb-list"` and composed class names
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
 * Renders a breadcrumb list item (<li>) with a data-slot attribute and default inline layout/styling.
 *
 * @param className - Optional additional CSS classes to merge with the component's default classes
 * @returns A `<li>` element configured as a breadcrumb item (`data-slot="breadcrumb-item"`)
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
 * Renders a breadcrumb link that is either a native anchor or renders its child element in-place when `asChild` is true.
 *
 * @param asChild - If true, render the passed child element in place of the anchor (enables slot-style composition).
 * @param className - Additional CSS classes to apply to the link.
 * @returns The breadcrumb link element.
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
 * Render a span that represents the current breadcrumb page.
 *
 * The element includes data-slot="breadcrumb-page", role="link", aria-disabled="true", and aria-current="page".
 *
 * @param className - Additional CSS class names to merge with the component's base classes
 * @param props - Additional span element props to forward to the rendered element
 * @returns A span element styled and annotated as the current breadcrumb page
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
 * Renders a list item to serve as the breadcrumb separator.
 *
 * If `children` is not provided, a ChevronRight icon is rendered by default.
 *
 * @param children - Optional content to display inside the separator; overrides the default icon when present.
 * @param className - Additional CSS class names to merge with the component's default separator styling.
 * @returns A `<li>` element marked as a breadcrumb separator.
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
 * Renders a non-interactive ellipsis used to indicate collapsed breadcrumb items.
 *
 * Renders a span with data-slot="breadcrumb-ellipsis", role="presentation", and aria-hidden="true"
 * containing a decorative ellipsis icon and a visually hidden "More" label for assistive technology.
 *
 * @param className - Optional additional class names merged with the component's default classes
 * @returns The rendered span element containing the ellipsis icon and an accessible "More" label
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