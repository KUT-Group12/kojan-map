'use client';

import * as React from 'react';
import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog';

import { cn } from './utils';
import { buttonVariants } from './button';

/**
 * Wraps the Radix AlertDialog Root and forwards all received props while adding a `data-slot="alert-dialog"` attribute.
 *
 * @param props - Props forwarded to `AlertDialogPrimitive.Root`
 * @returns A React element rendering the Radix AlertDialog Root with the `data-slot="alert-dialog"` attribute and all provided props applied.
 */
function AlertDialog({ ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Root>) {
  return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />;
}

/**
 * Renders the AlertDialog trigger element with a data-slot attribute for layout slots.
 *
 * @returns The underlying AlertDialog Trigger element with all received props forwarded.
 */
function AlertDialogTrigger({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Trigger>) {
  return <AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />;
}

/**
 * Renders the Radix AlertDialog Portal and forwards all received props while adding a data-slot attribute.
 *
 * @param props - Props to pass to Radix AlertDialog Primitive's Portal component.
 * @returns The Portal element with the `data-slot="alert-dialog-portal"` attribute and forwarded props.
 */
function AlertDialogPortal({ ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Portal>) {
  return <AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" {...props} />;
}

/**
 * Render an AlertDialog overlay with preset positioning, backdrop color, and state-based animations.
 *
 * @param className - Additional CSS classes to merge with the component's default overlay classes
 * @returns A React element representing the AlertDialog overlay/backdrop
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
 * Renders the alert dialog's content surface within a portal and overlay, applying positioning, sizing, animations, and any additional styling.
 *
 * @param className - Additional CSS class names to merge with the component's default styles.
 * @returns The rendered alert dialog content element.
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
 * Renders the header region for the alert dialog.
 *
 * Produces a div with data-slot="alert-dialog-header" that stacks children vertically,
 * centers text on small viewports, and left-aligns text on larger viewports. Accepts
 * standard div props; any provided `className` is merged with the component's layout classes.
 *
 * @returns The header div element for the alert dialog.
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
 * Footer container for the alert dialog that arranges action buttons responsively.
 *
 * @param className - Additional CSS classes to merge with the component's default layout classes.
 * @param props - Other props are forwarded to the underlying `div`.
 * @returns The footer container element.
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
 * Renders the alert dialog title with consistent typography and merged class names.
 *
 * @param className - Additional CSS classes to merge with the base title styles
 * @returns A React element for the dialog title with base "text-lg font-semibold" styling
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
 * Renders the alert dialog's description element with consistent styling and a data-slot.
 *
 * @returns The description element with `text-muted-foreground text-sm` classes merged with any provided `className`.
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
 * Renders an AlertDialog action button with the library's standard button styles.
 *
 * @param className - Additional CSS classes to append to the default button styles
 * @returns The AlertDialog action element with merged classes and all other props forwarded
 */
function AlertDialogAction({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Action>) {
  return <AlertDialogPrimitive.Action className={cn(buttonVariants(), className)} {...props} />;
}

/**
 * Renders the AlertDialog cancel action styled as an outlined button.
 *
 * @param className - Additional CSS class names to apply to the cancel button
 * @returns The rendered AlertDialog cancel element
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