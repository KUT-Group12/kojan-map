'use client';

import * as React from 'react';
import * as MenubarPrimitive from '@radix-ui/react-menubar';
import { CheckIcon, ChevronRightIcon, CircleIcon } from 'lucide-react';

import { cn } from './utils';

/**
 * Renders the Menubar root element with base styling and a data-slot attribute.
 *
 * @param props - Props forwarded to the underlying Radix Menubar Root. The `className` prop is merged with the component's default styling.
 * @returns The Menubar root React element.
 */
function Menubar({ className, ...props }: React.ComponentProps<typeof MenubarPrimitive.Root>) {
  return (
    <MenubarPrimitive.Root
      data-slot="menubar"
      className={cn(
        'bg-background flex h-9 items-center gap-1 rounded-md border p-1 shadow-xs',
        className
      )}
      {...props}
    />
  );
}

/**
 * Renders a wrapper around Radix's Menu primitive for use within the menubar.
 *
 * Applies data-slot="menubar-menu" and forwards all received props to the underlying primitive.
 *
 * @returns The menu element configured for inclusion in the menubar.
 */
function MenubarMenu({ ...props }: React.ComponentProps<typeof MenubarPrimitive.Menu>) {
  return <MenubarPrimitive.Menu data-slot="menubar-menu" {...props} />;
}

/**
 * Renders a Menubar group wrapper around Radix UI's Group primitive.
 *
 * @param props - Props forwarded to the underlying Radix Menubar Group primitive.
 * @returns The rendered Menubar group element
 */
function MenubarGroup({ ...props }: React.ComponentProps<typeof MenubarPrimitive.Group>) {
  return <MenubarPrimitive.Group data-slot="menubar-group" {...props} />;
}

/**
 * Renders a menubar portal element that hosts menubar content outside the normal DOM flow.
 *
 * @returns The Portal element configured for the menubar.
 */
function MenubarPortal({ ...props }: React.ComponentProps<typeof MenubarPrimitive.Portal>) {
  return <MenubarPrimitive.Portal data-slot="menubar-portal" {...props} />;
}

/**
 * Renders a RadioGroup element configured for use within the menubar and forwards all props.
 *
 * @returns The rendered RadioGroup element with `data-slot="menubar-radio-group"` and any provided props
 */
function MenubarRadioGroup({ ...props }: React.ComponentProps<typeof MenubarPrimitive.RadioGroup>) {
  return <MenubarPrimitive.RadioGroup data-slot="menubar-radio-group" {...props} />;
}

/**
 * Renders a styled menubar trigger element with a consistent data-slot and composed className.
 *
 * @param className - Additional class names to merge with the component's default styling
 * @returns A MenubarPrimitive.Trigger element with the default menubar trigger styles and `data-slot="menubar-trigger"`
 */
function MenubarTrigger({
  className,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Trigger>) {
  return (
    <MenubarPrimitive.Trigger
      data-slot="menubar-trigger"
      className={cn(
        'focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground flex items-center rounded-sm px-2 py-1 text-sm font-medium outline-hidden select-none',
        className
      )}
      {...props}
    />
  );
}

/**
 * Renders positioned Menubar content inside a portal.
 *
 * @param className - Additional CSS classes to apply to the content container
 * @param align - Horizontal alignment of the content relative to its trigger (e.g., `'start'`, `'center'`, `'end'`)
 * @param alignOffset - Pixel offset applied to alignment; positive values move the content away from the trigger
 * @param sideOffset - Pixel offset applied on the side axis; positive values move the content away from the trigger
 * @returns The React element for the Menubar content
 */
function MenubarContent({
  className,
  align = 'start',
  alignOffset = -4,
  sideOffset = 8,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Content>) {
  return (
    <MenubarPortal>
      <MenubarPrimitive.Content
        data-slot="menubar-content"
        align={align}
        alignOffset={alignOffset}
        sideOffset={sideOffset}
        className={cn(
          'bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[12rem] origin-(--radix-menubar-content-transform-origin) overflow-hidden rounded-md border p-1 shadow-md',
          className
        )}
        {...props}
      />
    </MenubarPortal>
  );
}

/**
 * Render a menubar item with standardized styling, optional inset spacing, and an optional destructive variant.
 *
 * @param inset - If true, applies inset spacing (adds left padding) to align with items that have icons.
 * @param variant - Visual variant of the item; `'destructive'` applies destructive styling, `'default'` applies normal styling.
 * @returns A configured MenubarPrimitive.Item React element with composed class names and data attributes.
 */
function MenubarItem({
  className,
  inset,
  variant = 'default',
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Item> & {
  inset?: boolean;
  variant?: 'default' | 'destructive';
}) {
  return (
    <MenubarPrimitive.Item
      data-slot="menubar-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  );
}

/**
 * Render a styled menubar checkbox menu item that displays a check indicator when selected.
 *
 * @returns A Menubar checkbox item element that contains the provided children and shows a check icon when `checked` is true.
 */
function MenubarCheckboxItem({
  className,
  children,
  checked,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.CheckboxItem>) {
  return (
    <MenubarPrimitive.CheckboxItem
      data-slot="menubar-checkbox-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-xs py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      checked={checked}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <MenubarPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </MenubarPrimitive.ItemIndicator>
      </span>
      {children}
    </MenubarPrimitive.CheckboxItem>
  );
}

/**
 * Renders a Menubar-styled radio item with a left-positioned circular indicator.
 *
 * Accepts all props supported by Radix's RadioItem and applies menubar-specific styling
 * and markup (including an ItemIndicator containing a circle icon).
 *
 * @param className - Optional additional CSS class names to merge with the component's styles.
 * @param children - Content to display for the radio item.
 * @returns A React element representing a styled menubar radio item.
 */
function MenubarRadioItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.RadioItem>) {
  return (
    <MenubarPrimitive.RadioItem
      data-slot="menubar-radio-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-xs py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <MenubarPrimitive.ItemIndicator>
          <CircleIcon className="size-2 fill-current" />
        </MenubarPrimitive.ItemIndicator>
      </span>
      {children}
    </MenubarPrimitive.RadioItem>
  );
}

/**
 * Renders a styled menubar label.
 *
 * When `inset` is true, applies extra left padding to align with inset items.
 *
 * @param inset - If true, adds left padding for inset alignment.
 * @returns The menubar label element with composed styling and data attributes.
 */
function MenubarLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Label> & {
  inset?: boolean;
}) {
  return (
    <MenubarPrimitive.Label
      data-slot="menubar-label"
      data-inset={inset}
      className={cn('px-2 py-1.5 text-sm font-medium data-[inset]:pl-8', className)}
      {...props}
    />
  );
}

/**
 * Renders a horizontal separator used within the Menubar.
 *
 * @param className - Additional CSS classes to merge with the component's default separator styles.
 * @returns A React element representing a styled menubar separator.
 */
function MenubarSeparator({
  className,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Separator>) {
  return (
    <MenubarPrimitive.Separator
      data-slot="menubar-separator"
      className={cn('bg-border -mx-1 my-1 h-px', className)}
      {...props}
    />
  );
}

/**
 * Displays a right-aligned keyboard shortcut label for a menubar item.
 *
 * @returns The span element used to show a muted, small, wide-tracked shortcut aligned to the right.
 */
function MenubarShortcut({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="menubar-shortcut"
      className={cn('text-muted-foreground ml-auto text-xs tracking-widest', className)}
      {...props}
    />
  );
}

/**
 * Wraps Radix's Menubar Sub primitive and ensures a `data-slot="menubar-sub"` attribute is applied.
 *
 * @returns A React element rendering `MenubarPrimitive.Sub` with the `data-slot="menubar-sub"` attribute and any provided props.
 */
function MenubarSub({ ...props }: React.ComponentProps<typeof MenubarPrimitive.Sub>) {
  return <MenubarPrimitive.Sub data-slot="menubar-sub" {...props} />;
}

/**
 * Renders a submenu trigger within the menubar, showing its children and a right chevron.
 *
 * @param inset - When `true`, applies inset styling (additional left padding) to align with other indented items.
 * @returns A Menubar SubTrigger element containing the provided children and a right-aligned chevron icon.
 */
function MenubarSubTrigger({
  className,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.SubTrigger> & {
  inset?: boolean;
}) {
  return (
    <MenubarPrimitive.SubTrigger
      data-slot="menubar-sub-trigger"
      data-inset={inset}
      className={cn(
        'focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-none select-none data-[inset]:pl-8',
        className
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto h-4 w-4" />
    </MenubarPrimitive.SubTrigger>
  );
}

/**
 * Renders a styled sub-menu content container for the menubar.
 *
 * @param className - Additional classes to merge with the component's default styling.
 * @param props - Props forwarded to the underlying Radix SubContent primitive.
 * @returns The rendered sub-menu content element with menubar-specific styling, positioning, and open/close animations.
 */
function MenubarSubContent({
  className,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.SubContent>) {
  return (
    <MenubarPrimitive.SubContent
      data-slot="menubar-sub-content"
      className={cn(
        'bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[8rem] origin-(--radix-menubar-content-transform-origin) overflow-hidden rounded-md border p-1 shadow-lg',
        className
      )}
      {...props}
    />
  );
}

export {
  Menubar,
  MenubarPortal,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarGroup,
  MenubarSeparator,
  MenubarLabel,
  MenubarItem,
  MenubarShortcut,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
};