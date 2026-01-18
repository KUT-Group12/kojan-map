import * as React from 'react';
import { ChevronLeftIcon, ChevronRightIcon, MoreHorizontalIcon } from 'lucide-react';

import { cn } from './utils';
import { Button, buttonVariants } from './button';

/**
 * Renders a pagination navigation container.
 *
 * The element is configured for accessibility and styling and forwards any additional
 * navigation props to the underlying <nav>.
 *
 * @param className - Optional additional CSS classes to apply to the container
 * @returns A <nav> element configured for pagination
 */
function Pagination({ className, ...props }: React.ComponentProps<'nav'>) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      className={cn('mx-auto flex w-full justify-center', className)}
      {...props}
    />
  );
}

/**
 * Renders the pagination content container as a `<ul>` element.
 *
 * The element uses default layout classes for horizontal pagination and merges any
 * provided `className`. Additional props are spread onto the `<ul>` element.
 *
 * @param className - Additional CSS classes appended to the default layout classes
 * @returns A `<ul>` element serving as the pagination content container
 */
function PaginationContent({ className, ...props }: React.ComponentProps<'ul'>) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn('flex flex-row items-center gap-1', className)}
      {...props}
    />
  );
}

/**
 * Renders a list item element used as a pagination item container.
 *
 * @param props - HTML attributes and event handlers forwarded to the underlying `<li>` element
 * @returns The rendered `<li>` element with `data-slot="pagination-item"`
 */
function PaginationItem({ ...props }: React.ComponentProps<'li'>) {
  return <li data-slot="pagination-item" {...props} />;
}

type PaginationLinkProps = {
  isActive?: boolean;
} & Pick<React.ComponentProps<typeof Button>, 'size'> &
  React.ComponentProps<'a'>;

/**
 * Render a styled pagination anchor that reflects and exposes the current active state.
 *
 * @param isActive - When `true`, marks the link as the current page (sets `aria-current="page"` and uses the active button variant)
 * @param size - Controls the button size variant applied to the link (defaults to `'icon'`)
 * @returns The anchor element used as a pagination link, styled according to `isActive` and `size`
 */
function PaginationLink({ className, isActive, size = 'icon', ...props }: PaginationLinkProps) {
  return (
    <a
      aria-current={isActive ? 'page' : undefined}
      data-slot="pagination-link"
      data-active={isActive}
      className={cn(
        buttonVariants({
          variant: isActive ? 'outline' : 'ghost',
          size,
        }),
        className
      )}
      {...props}
    />
  );
}

/**
 * Renders a pagination control linking to the previous page.
 *
 * The control includes a left chevron icon and a visually hidden "Previous" label on small screens,
 * and applies default sizing and spacing for pagination buttons.
 *
 * @returns A PaginationLink element configured as the "previous page" control
 */
function PaginationPrevious({ className, ...props }: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Go to previous page"
      size="default"
      className={cn('gap-1 px-2.5 sm:pl-2.5', className)}
      {...props}
    >
      <ChevronLeftIcon />
      <span className="hidden sm:block">Previous</span>
    </PaginationLink>
  );
}

/**
 * Renders a "Next" pagination link containing a right chevron icon.
 *
 * @param props - Props forwarded to PaginationLink (including `className`) to customize the rendered anchor.
 * @returns A PaginationLink element labeled "Next" for navigating to the next page.
 */
function PaginationNext({ className, ...props }: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Go to next page"
      size="default"
      className={cn('gap-1 px-2.5 sm:pr-2.5', className)}
      {...props}
    >
      <span className="hidden sm:block">Next</span>
      <ChevronRightIcon />
    </PaginationLink>
  );
}

/**
 * Renders an accessible pagination ellipsis element indicating there are more pages.
 *
 * @param className - Additional CSS classes to apply to the wrapper
 * @returns A span containing a horizontal ellipsis icon and a visually hidden "More pages" label for screen readers
 */
function PaginationEllipsis({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn('flex size-9 items-center justify-center', className)}
      {...props}
    >
      <MoreHorizontalIcon className="size-4" />
      <span className="sr-only">More pages</span>
    </span>
  );
}

export {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
};