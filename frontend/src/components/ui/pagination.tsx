import * as React from 'react';
import { ChevronLeftIcon, ChevronRightIcon, MoreHorizontalIcon } from 'lucide-react';

import { cn } from './utils';
import { Button, buttonVariants } from './button';

/**
 * Renders a semantic navigation container for pagination controls.
 *
 * @param props - Props forwarded to the underlying <nav> element; `className` is merged with the component's default layout classes.
 * @returns The navigation element used as the pagination container.
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
 * Container element that wraps pagination items.
 *
 * Renders an unordered list with the `data-slot="pagination-content"` attribute and default layout classes; any additional `ul` props are forwarded to the element.
 *
 * @param className - Optional additional CSS class names merged with the component's default classes
 * @returns The rendered `ul` element used as the pagination content slot
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
 * Renders a list item that serves as a container for a single pagination item.
 *
 * @returns A `li` element with `data-slot="pagination-item"` and any passed props.
 */
function PaginationItem({ ...props }: React.ComponentProps<'li'>) {
  return <li data-slot="pagination-item" {...props} />;
}

type PaginationLinkProps = {
  isActive?: boolean;
} & Pick<React.ComponentProps<typeof Button>, 'size'> &
  React.ComponentProps<'a'>;

/**
 * Render a styled pagination link with active state and ARIA support.
 *
 * @param isActive - When `true`, marks the link as the current page (sets `aria-current="page"` and applies active styling).
 * @param size - Button size variant to apply; defaults to `'icon'`.
 * @returns The anchor element to use as a pagination link.
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
 * Renders a pagination control for navigating to the previous page.
 *
 * @returns A PaginationLink element labeled "Go to previous page" containing a left chevron icon and a "Previous" label.
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
 * Render a "Next" pagination control.
 *
 * @returns A pagination link element labeled "Next" with a right-chevron icon and an aria-label for navigating to the next page.
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
 * Renders an accessible ellipsis indicator used to represent omitted pages in pagination.
 *
 * @returns A span element containing a visual ellipsis icon and a screen-reader-only label "More pages".
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