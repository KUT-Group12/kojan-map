'use client';

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { XIcon } from 'lucide-react';

import { cn } from './utils';

/**
 * Renders the Dialog root and forwards all received props to Radix UI's DialogPrimitive.Root.
 *
 * @param props - Props forwarded to the underlying DialogPrimitive.Root
 * @returns The Dialog root element with `data-slot="dialog"` applied
 */
function Dialog({ ...props }: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

/**
 * Renders a dialog trigger element.
 *
 * @returns The rendered dialog trigger element with the provided props and a `data-slot="dialog-trigger"` attribute.
 */
function DialogTrigger({ ...props }: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

/**
 * Renders a Dialog portal wrapper that forwards props to Radix UI's Portal and marks it with `data-slot="dialog-portal"`.
 *
 * @param props - Props forwarded to `DialogPrimitive.Portal`; any children provided will be rendered inside the portal.
 * @returns The Portal element with the provided props and `data-slot="dialog-portal"`.
 */
function DialogPortal({ ...props }: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

/**
 * Renders the dialog's close control.
 *
 * Forwards all received props to the underlying Radix Close primitive and sets
 * `data-slot="dialog-close"` on the rendered element.
 *
 * @param props - Props to forward to the underlying Close component
 * @returns A React element representing the dialog close control
 */
function DialogClose({ ...props }: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => {
  return (
    <DialogPrimitive.Overlay
      ref={ref}
      data-slot="dialog-overlay"
      className={cn(
        'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50',
        className
      )}
      {...props}
    />
  );
});
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

/**
 * Renders dialog content inside a portal with an overlay and a built-in close control.
 *
 * @returns A React element containing the dialog content rendered in a portal, including the overlay and a close button
 */
function DialogContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          'bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg',
          className
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4">
          <XIcon />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

/**
 * Renders a dialog header container that provides default layout, spacing, and slot metadata.
 *
 * @param className - Additional CSS classes to merge with the component's default header classes.
 * @returns The rendered `div` element used as the dialog header; default layout and spacing classes are applied and any other supplied props are forwarded.
 */
function DialogHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="dialog-header"
      className={cn('flex flex-col gap-2 text-center sm:text-left', className)}
      {...props}
    />
  );
}

/**
 * Renders a dialog footer container with responsive layout and spacing.
 *
 * @param className - Additional CSS classes appended to the footer's default layout classes
 * @param props - Additional `div` attributes and event handlers forwarded to the container
 * @returns The rendered footer `div` element used to contain dialog actions
 */
function DialogFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)}
      {...props}
    />
  );
}

/**
 * Renders a styled dialog title element.
 *
 * @param className - Additional CSS classes to merge with the default title styles
 * @param props - Other props forwarded to Radix's DialogPrimitive.Title
 * @returns The rendered dialog title element
 */
function DialogTitle({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn('text-lg leading-none font-semibold', className)}
      {...props}
    />
  );
}

/**
 * Renders the dialog description element with default muted styling and optional custom classes.
 *
 * @param className - Additional CSS classes appended to the default `text-muted-foreground text-sm` styles.
 * @returns The dialog description element ready to be placed inside a dialog.
 */
function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};