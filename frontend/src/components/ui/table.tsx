'use client';

import * as React from 'react';

import { cn } from './utils';

/**
 * Renders a table inside a horizontally scrollable container with base table styling.
 *
 * @param className - Additional CSS class names to merge with the component's base table classes
 * @param props - Additional attributes and event handlers spread to the underlying `table` element
 * @returns A JSX element containing the table wrapped in a scrollable container
 */
function Table({ className, ...props }: React.ComponentProps<'table'>) {
  return (
    <div data-slot="table-container" className="relative w-full overflow-x-auto">
      <table
        data-slot="table"
        className={cn('w-full caption-bottom text-sm', className)}
        {...props}
      />
    </div>
  );
}

/**
 * Renders the table header container.
 *
 * Applies a bottom border to child rows and forwards any provided `className` and remaining props to the resulting `<thead>` element.
 *
 * @returns The rendered `<thead>` element used as the table header
 */
function TableHeader({ className, ...props }: React.ComponentProps<'thead'>) {
  return <thead data-slot="table-header" className={cn('[&_tr]:border-b', className)} {...props} />;
}

/**
 * Renders a tbody element with styling that removes the bottom border from the last row, merges any provided classes, and forwards remaining props to the element.
 *
 * @param className - Additional class names to merge with the default styling
 * @returns The rendered tbody element
 */
function TableBody({ className, ...props }: React.ComponentProps<'tbody'>) {
  return (
    <tbody
      data-slot="table-body"
      className={cn('[&_tr:last-child]:border-0', className)}
      {...props}
    />
  );
}

/**
 * Renders a table footer (<tfoot>) with muted background, top border, bold font weight, and the `data-slot="table-footer"` attribute while forwarding remaining props.
 *
 * @param className - Additional CSS class names to merge with the component's default styles.
 * @returns The rendered `tfoot` element with merged classes and forwarded props.
 */
function TableFooter({ className, ...props }: React.ComponentProps<'tfoot'>) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn('bg-muted/50 border-t font-medium [&>tr]:last:border-b-0', className)}
      {...props}
    />
  );
}

/**
 * Renders a table row element with interactive styling and integration hooks for the table components.
 *
 * Applies hover and selected-state background, a bottom border, and color transitions; merges the provided `className` with its base classes and forwards all other props to the underlying `<tr>`.
 *
 * @returns A `<tr>` element with data-slot="table-row", combined classes for hover/selected/border/transition, and forwarded props.
 */
function TableRow({ className, ...props }: React.ComponentProps<'tr'>) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        'hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors',
        className
      )}
      {...props}
    />
  );
}

/**
 * Renders a table header cell (<th>) with consistent typography, spacing, and checkbox-aware layout.
 *
 * Applies default styles for text color, height, horizontal padding, left and vertical alignment, font weight,
 * and prevents text wrapping. If the cell contains a checkbox, it removes right padding and nudges the checkbox
 * vertically for visual alignment.
 *
 * @param className - Additional class names to merge with the default styles
 * @param props - Additional attributes forwarded to the underlying `<th>` element
 * @returns The rendered table header cell element
 */
function TableHead({ className, ...props }: React.ComponentProps<'th'>) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        'text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
        className
      )}
      {...props}
    />
  );
}

/**
 * Renders a table cell (<td>) element used by the table components with shared styling and a data-slot attribute.
 *
 * @param className - Additional CSS classes to merge with the component's base styles.
 * @param props - Additional props spread to the underlying `<td>` element.
 * @returns The rendered `<td>` element with merged classes and `data-slot="table-cell"`.
 */
function TableCell({ className, ...props }: React.ComponentProps<'td'>) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        'p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
        className
      )}
      {...props}
    />
  );
}

/**
 * Renders a table caption element with muted foreground styling and top margin, allowing additional classes and props.
 *
 * @param className - Additional CSS classes to merge with the component's default classes
 * @param props - Other props forwarded to the underlying `caption` element
 * @returns The rendered `caption` element
 */
function TableCaption({ className, ...props }: React.ComponentProps<'caption'>) {
  return (
    <caption
      data-slot="table-caption"
      className={cn('text-muted-foreground mt-4 text-sm', className)}
      {...props}
    />
  );
}

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption };