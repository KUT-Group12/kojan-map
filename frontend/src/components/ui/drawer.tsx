'use client';

import * as React from 'react';
import { Drawer as DrawerPrimitive } from 'vaul';

import { cn } from './utils';

/**
 * Render a Drawer root element with a consistent data-slot attribute.
 *
 * @param props - Props forwarded to the underlying DrawerPrimitive.Root component
 * @returns The rendered Drawer root element
 */
function Drawer({ ...props }: React.ComponentProps<typeof DrawerPrimitive.Root>) {
  return <DrawerPrimitive.Root data-slot="drawer" {...props} />;
}

/**
 * Renders a drawer trigger element that forwards all props and sets `data-slot="drawer-trigger"`.
 *
 * @returns A JSX element representing the drawer trigger.
 */
function DrawerTrigger({ ...props }: React.ComponentProps<typeof DrawerPrimitive.Trigger>) {
  return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />;
}

/**
 * Renders a portal for the drawer that forwards all props to the underlying vaul Portal element.
 *
 * @returns The Portal element with data-slot="drawer-portal" and all provided props forwarded.
 */
function DrawerPortal({ ...props }: React.ComponentProps<typeof DrawerPrimitive.Portal>) {
  return <DrawerPrimitive.Portal data-slot="drawer-portal" {...props} />;
}

/**
 * Renders a drawer close control and forwards all received props to the underlying close primitive while adding `data-slot="drawer-close"`.
 *
 * @param props - Props forwarded to the underlying close primitive element.
 * @returns The rendered drawer close element.
 */
function DrawerClose({ ...props }: React.ComponentProps<typeof DrawerPrimitive.Close>) {
  return <DrawerPrimitive.Close data-slot="drawer-close" {...props} />;
}

/**
 * Render the drawer overlay with standardized attributes and styling.
 *
 * @param className - Additional CSS classes appended to the overlay's default styles
 * @param props - Remaining props forwarded to the underlying Overlay primitive
 * @returns The drawer overlay element with `data-slot="drawer-overlay"`, composed classes for animations/positioning, and forwarded props
 */
function DrawerOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Overlay>) {
  return (
    <DrawerPrimitive.Overlay
      data-slot="drawer-overlay"
      className={cn(
        'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50',
        className
      )}
      {...props}
    />
  );
}

/**
 * Renders the drawer's content inside a portal with an overlay and responsive directional styling.
 *
 * @param className - Additional CSS classes to merge with the component's default styles.
 * @param children - Elements to display inside the drawer content.
 * @returns The rendered drawer content element with applied portal, overlay, data-slot attributes, and composed classes.
 */
function DrawerContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Content>) {
  return (
    <DrawerPortal data-slot="drawer-portal">
      <DrawerOverlay />
      <DrawerPrimitive.Content
        data-slot="drawer-content"
        className={cn(
          'group/drawer-content bg-background fixed z-50 flex h-auto flex-col',
          'data-[vaul-drawer-direction=top]:inset-x-0 data-[vaul-drawer-direction=top]:top-0 data-[vaul-drawer-direction=top]:mb-24 data-[vaul-drawer-direction=top]:max-h-[80vh] data-[vaul-drawer-direction=top]:rounded-b-lg data-[vaul-drawer-direction=top]:border-b',
          'data-[vaul-drawer-direction=bottom]:inset-x-0 data-[vaul-drawer-direction=bottom]:bottom-0 data-[vaul-drawer-direction=bottom]:mt-24 data-[vaul-drawer-direction=bottom]:max-h-[80vh] data-[vaul-drawer-direction=bottom]:rounded-t-lg data-[vaul-drawer-direction=bottom]:border-t',
          'data-[vaul-drawer-direction=right]:inset-y-0 data-[vaul-drawer-direction=right]:right-0 data-[vaul-drawer-direction=right]:w-3/4 data-[vaul-drawer-direction=right]:border-l data-[vaul-drawer-direction=right]:sm:max-w-sm',
          'data-[vaul-drawer-direction=left]:inset-y-0 data-[vaul-drawer-direction=left]:left-0 data-[vaul-drawer-direction=left]:w-3/4 data-[vaul-drawer-direction=left]:border-r data-[vaul-drawer-direction=left]:sm:max-w-sm',
          className
        )}
        {...props}
      >
        <div className="bg-muted mx-auto mt-4 hidden h-2 w-[100px] shrink-0 rounded-full group-data-[vaul-drawer-direction=bottom]/drawer-content:block" />
        {children}
      </DrawerPrimitive.Content>
    </DrawerPortal>
  );
}

/**
 * Renders the drawer header container with preset layout and spacing.
 *
 * The rendered div receives data-slot="drawer-header" and default classes for vertical layout,
 * gap, and padding; any `className` provided is appended to these defaults and all other props
 * are forwarded to the underlying div.
 *
 * @param className - Additional CSS classes to merge with the component's default classes
 * @returns The drawer header element
 */
function DrawerHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="drawer-header"
      className={cn('flex flex-col gap-1.5 p-4', className)}
      {...props}
    />
  );
}

/**
 * Renders the footer container for a drawer with consistent spacing and layout.
 *
 * @returns A `div` element with `data-slot="drawer-footer"` and composed classes for footer layout (`mt-auto`, vertical gap, and padding).
 */
function DrawerFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="drawer-footer"
      className={cn('mt-auto flex flex-col gap-2 p-4', className)}
      {...props}
    />
  );
}

/**
 * Renders a drawer title element with consistent styling and a `data-slot="drawer-title"` attribute.
 *
 * Accepts all props supported by the underlying `DrawerPrimitive.Title`. The `className` prop is merged
 * with default classes (`text-foreground font-semibold`) to ensure consistent typography.
 *
 * @param props - Props forwarded to the underlying drawer title element
 * @returns A React element for the drawer title
 */
function DrawerTitle({ className, ...props }: React.ComponentProps<typeof DrawerPrimitive.Title>) {
  return (
    <DrawerPrimitive.Title
      data-slot="drawer-title"
      className={cn('text-foreground font-semibold', className)}
      {...props}
    />
  );
}

/**
 * Renders a drawer description element with consistent styling and a `data-slot="drawer-description"` attribute.
 *
 * @param className - Additional CSS class names to merge with the component's default styles
 * @param props - Props forwarded to the underlying `DrawerPrimitive.Description` element
 * @returns The rendered drawer description element
 */
function DrawerDescription({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Description>) {
  return (
    <DrawerPrimitive.Description
      data-slot="drawer-description"
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  );
}

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
};