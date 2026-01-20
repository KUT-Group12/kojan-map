'use client';

import * as React from 'react';
import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog';

import { cn } from './utils';
import { buttonVariants } from './button';

/**
 * Provides the root element and state context for a themed alert dialog.
 *
 * @param props - Props forwarded to the underlying AlertDialog root; any attributes and event handlers provided are applied to the rendered element.
 * @returns A React element for the alert dialog root with a `data-slot="alert-dialog"` attribute.
 */
function AlertDialog({ ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Root>) {
  return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />;
}

/**
 * Renders the AlertDialog trigger element.
 *
 * @returns The AlertDialog trigger element with any provided props and a `data-slot="alert-dialog-trigger"` attribute.
 */
function AlertDialogTrigger({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Trigger>) {
  return <AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />;
}

/**
 * Renders AlertDialogPrimitive.Portal with a `data-slot` attribute of `"alert-dialog-portal"`.
 *
 * @returns The Portal element used to render alert dialog content into a React portal.
 */
function AlertDialogPortal({ ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Portal>) {
  return <AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" {...props} />;
}

/**
 * Renders the AlertDialog overlay with built-in backdrop styling and open/close transition classes.
 *
 * @param className - Additional CSS class names to merge with the overlay's default styles
 * @returns The alert dialog overlay element
 */
function AlertDialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Overlay>) {
  return (
    <AlertDialogPrimitive.Overlay
      data-slot="alert-dialog-overlay"
      className={cn(
        'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50',
        className
      )}
      {...props}
    />
  );
}

/**
 * Renders dialog content inside a portal with a themed overlay and default layout/styling.
 *
 * @param className - Additional CSS class names to merge with the component's default styles
 * @param props - Remaining props forwarded to the underlying AlertDialog content element
 * @returns The AlertDialog content element rendered inside a portal and paired with the overlay
 */
function AlertDialogContent({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Content>) {
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Content
        data-slot="alert-dialog-content"
        className={cn(
          'bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg',
          className
        )}
        {...props}
      />
    </AlertDialogPortal>
  );
}

/**
 * Renders the AlertDialog header container with responsive alignment and vertical spacing.
 *
 * @param className - Additional CSS classes to append to the header container
 * @param props - Other props are spread onto the underlying `div` element
 * @returns A `div` element used as the alert dialog header container
 */
function AlertDialogHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-dialog-header"
      className={cn('flex flex-col gap-2 text-center sm:text-left', className)}
      {...props}
    />
  );
}

/**
 * Footer container for AlertDialog actions with a responsive layout that stacks buttons in column-reverse on small screens and aligns them to the end in a row on larger screens.
 *
 * @param className - Additional class names to apply to the footer container
 * @param props - Additional props are spread onto the underlying `div` element
 * @returns A `div` element used as the dialog footer for action controls
 */
function AlertDialogFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-dialog-footer"
      className={cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)}
      {...props}
    />
  );
}

/**
 * Renders the alert dialog title element with theme-consistent typography.
 *
 * @returns The alert dialog title element (`AlertDialogPrimitive.Title`) with default large, bold text, an applied `className` merge, and a `data-slot="alert-dialog-title"` attribute.
 */
function AlertDialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Title>) {
  return (
    <AlertDialogPrimitive.Title
      data-slot="alert-dialog-title"
      className={cn('text-lg font-semibold', className)}
      {...props}
    />
  );
}

/**
 * Renders the alert dialog description element with themed typography and a data-slot attribute.
 *
 * @param className - Additional class names to merge with the default muted, small-text styling
 * @returns The dialog description element with combined classes and `data-slot="alert-dialog-description"`
 */
function AlertDialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Description>) {
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  );
}

/**
 * Renders a themed action button for the AlertDialog.
 *
 * @param className - Additional CSS class names to apply to the button
 * @returns A React element representing the dialog's action/confirm button
 */
function AlertDialogAction({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Action>) {
  return <AlertDialogPrimitive.Action className={cn(buttonVariants(), className)} {...props} />;
}

/**
 * Styled cancel button for an AlertDialog that applies the outline button variant.
 *
 * Forwards all props to the underlying AlertDialog primitive and composes its `className` with the outline button styles.
 *
 * @returns The rendered AlertDialog cancel button element with outline styling.
 */
function AlertDialogCancel({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Cancel>) {
  return (
    <AlertDialogPrimitive.Cancel
      className={cn(buttonVariants({ variant: 'outline' }), className)}
      {...props}
    />
  );
}

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};