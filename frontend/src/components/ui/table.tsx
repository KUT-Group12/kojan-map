'use client';

import * as React from 'react';

import { cn } from './utils';

/**
 * Renders a full-width, horizontally scrollable table inside a relative container.
 *
 * @param className - Additional CSS classes appended to the table's base classes
 * @param props - All other props are forwarded to the underlying `<table>` element
 * @returns The table element wrapped in a scrollable container
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
 * Renders a table header (<thead>) with a data-slot attribute and default row-bottom borders.
 *
 * @param props - Props forwarded to the underlying `<thead>`; `className` is merged with the component's default styles.
 * @returns The `<thead>` element with `data-slot="table-header"` and a bottom border applied to child rows.
 */
function TableHeader({ className, ...props }: React.ComponentProps<'thead'>) {
  return <thead data-slot="table-header" className={cn('[&_tr]:border-b', className)} {...props} />;
}

/**
 * Renders a table body (<tbody>) with default layout styles and merged class names.
 *
 * @param className - Additional class names to merge with the component's default styles
 * @param props - All other props are forwarded to the underlying `<tbody>` element
 * @returns A `<tbody>` element with `data-slot="table-body"`, default styling (`[&_tr:last-child]:border-0`), merged `className`, and forwarded props
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
 * Renders a table footer element with default footer styling and a data-slot attribute.
 *
 * Applies a muted semi-transparent background, top border, medium font weight, and a rule to remove the bottom border from the last row; merges any provided `className` and forwards all other props to the underlying `<tfoot>`.
 *
 * @returns A `<tfoot>` element with `data-slot="table-footer"`, the merged `className`, and forwarded props.
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
 * Renders a table row element with standardized styling and a data-slot attribute.
 *
 * @param className - Additional class names appended to the component's default styles
 * @returns The rendered `tr` element with hover/selected background, bottom border, merged `className`, and all forwarded props
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
 * Renders a table header cell (<th>) with default styling and a data-slot attribute.
 *
 * Applies built-in classes for height, padding, alignment, font weight, whitespace handling,
 * and checkbox layout; merges any provided `className` and forwards remaining props to the element.
 *
 * @param className - Additional CSS class names to merge with the component's defaults
 * @param props - Other props forwarded to the underlying `<th>` element
 * @returns A `<th>` element with merged class names, `data-slot="table-head"`, and forwarded props
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
 * Renders a table cell (`td`) with standardized padding, vertical alignment, nowrap behavior, and special handling for nested checkboxes.
 *
 * @returns The rendered `td` element with merged `className` and all other props forwarded to the underlying element.
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
 * Renders a table caption element styled with muted foreground, top margin, and small text.
 *
 * @returns A caption element (data-slot="table-caption") with those styles applied; additional props (including `className`) are forwarded to the element.
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