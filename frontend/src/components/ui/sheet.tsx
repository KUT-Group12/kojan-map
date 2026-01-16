'use client';

import * as React from 'react';
import * as SheetPrimitive from '@radix-ui/react-dialog';
import { XIcon } from 'lucide-react';

import { cn } from './utils';

/**
 * Root component for the Sheet UI that renders Radix's Sheet.Root with a data-slot of "sheet".
 *
 * @param props - Props forwarded to the underlying Sheet primitive
 * @returns The rendered Sheet root React element
 */
function Sheet({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />;
}

/**
 * Renders a trigger element that toggles the sheet.
 *
 * @returns A React element that acts as the sheet trigger.
 */
function SheetTrigger({ ...props }: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

/**
 * Renders a sheet close trigger that closes the sheet when activated.
 *
 * @param props - Props forwarded to the underlying Radix Sheet Close primitive.
 * @returns The rendered sheet close trigger element.
 */
function SheetClose({ ...props }: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />;
}

/**
 * Renders a portal container for sheet content with a data-slot of "sheet-portal" and forwards all props to the underlying portal.
 *
 * @returns The sheet portal element.
 */
function SheetPortal({ ...props }: React.ComponentProps<typeof SheetPrimitive.Portal>) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />;
}

/**
 * Renders the sheet overlay with a semi-transparent backdrop and entry/exit animations.
 *
 * @param className - Additional CSS classes to append to the overlay's class list
 * @returns The overlay element (`SheetPrimitive.Overlay`) with `data-slot="sheet-overlay"` and composed classes
 */
function SheetOverlay({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  return (
    <SheetPrimitive.Overlay
      data-slot="sheet-overlay"
      className={cn(
        'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50',
        className
      )}
      {...props}
    />
  );
}

/**
 * Renders a sheet panel inside a portal with an overlay, positioned on the specified side and including a close control.
 *
 * @param className - Additional classes to apply to the sheet content container
 * @param side - Which edge the sheet should appear from: `"top"`, `"right"`, `"bottom"`, or `"left"` (default: `"right"`)
 * @returns The sheet content element with portal, overlay, and an accessible close button
 */
function SheetContent({
  className,
  children,
  side = 'right',
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
  side?: 'top' | 'right' | 'bottom' | 'left';
}) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        className={cn(
          'bg-background data-[state=open]:animate-in data-[state=closed]:animate-out fixed z-50 flex flex-col gap-4 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500',
          side === 'right' &&
            'data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm',
          side === 'left' &&
            'data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm',
          side === 'top' &&
            'data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top inset-x-0 top-0 h-auto border-b',
          side === 'bottom' &&
            'data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom inset-x-0 bottom-0 h-auto border-t',
          className
        )}
        {...props}
      >
        {children}
        <SheetPrimitive.Close className="ring-offset-background focus:ring-ring data-[state=open]:bg-secondary absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none">
          <XIcon className="size-4" />
          <span className="sr-only">Close</span>
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPortal>
  );
}

/**
 * Container for the sheet's header content that applies header layout and spacing.
 *
 * Renders a div with data-slot "sheet-header" and base classes for a vertical layout,
 * gap, and padding; merges any provided `className` and forwards other div props.
 *
 * @returns The header div element for use inside a Sheet.
 */
function SheetHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sheet-header"
      className={cn('flex flex-col gap-1.5 p-4', className)}
      {...props}
    />
  );
}

/**
 * Container for footer content inside a Sheet.
 *
 * Renders a div with layout and spacing suited for a sheet footer and a `data-slot="sheet-footer"` attribute.
 *
 * @param className - Additional CSS classes to merge with the footer's base styles
 * @returns The footer element to place at the bottom of a Sheet
 */
function SheetFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn('mt-auto flex flex-col gap-2 p-4', className)}
      {...props}
    />
  );
}

/**
 * Renders the sheet's title element with base typography and merged className.
 *
 * Accepts the same props as the underlying SheetPrimitive.Title; the provided
 * `className` is merged with the component's default styling.
 *
 * @returns The rendered sheet title element.
 */
function SheetTitle({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn('text-foreground font-semibold', className)}
      {...props}
    />
  );
}

/**
 * Renders a sheet description element with consistent muted styling and a data-slot of "sheet-description".
 *
 * @returns A `SheetPrimitive.Description` element with small, muted foreground text and the provided `className` merged into its classes.
 */
function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  );
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};