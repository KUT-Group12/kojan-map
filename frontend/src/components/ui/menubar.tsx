'use client';

import * as React from 'react';
import * as MenubarPrimitive from '@radix-ui/react-menubar';
import { CheckIcon, ChevronRightIcon, CircleIcon } from 'lucide-react';

import { cn } from './utils';

/**
 * Renders the menubar root with consistent styling and a `data-slot="menubar"` attribute.
 *
 * @param className - Additional CSS classes to merge with the component's base styles.
 * @returns A React element representing the styled menubar root.
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
 * Renders a menubar menu element with a fixed `data-slot` attribute while forwarding all received props.
 *
 * @returns A `MenubarPrimitive.Menu` React element with `data-slot="menubar-menu"` and the provided props applied.
 */
function MenubarMenu({ ...props }: React.ComponentProps<typeof MenubarPrimitive.Menu>) {
  return <MenubarPrimitive.Menu data-slot="menubar-menu" {...props} />;
}

/**
 * Render a Menubar Group wrapper that sets `data-slot="menubar-group"` and forwards all props to Radix's `MenubarPrimitive.Group`.
 *
 * @returns A React element representing a Menubar Group with `data-slot="menubar-group"`.
 */
function MenubarGroup({ ...props }: React.ComponentProps<typeof MenubarPrimitive.Group>) {
  return <MenubarPrimitive.Group data-slot="menubar-group" {...props} />;
}

/**
 * Render a Menubar Portal element that injects a `data-slot="menubar-portal"` attribute and forwards all props.
 *
 * @returns The Menubar portal element with `data-slot="menubar-portal"` and any provided props forwarded to the underlying Radix Portal.
 */
function MenubarPortal({ ...props }: React.ComponentProps<typeof MenubarPrimitive.Portal>) {
  return <MenubarPrimitive.Portal data-slot="menubar-portal" {...props} />;
}

/**
 * Renders a Radix RadioGroup configured for use inside the menubar.
 *
 * @param props - Props forwarded to the underlying Radix `RadioGroup`
 * @returns A `RadioGroup` element with `data-slot="menubar-radio-group"` and all provided props forwarded
 */
function MenubarRadioGroup({ ...props }: React.ComponentProps<typeof MenubarPrimitive.RadioGroup>) {
  return <MenubarPrimitive.RadioGroup data-slot="menubar-radio-group" {...props} />;
}

/**
 * Styled wrapper around Radix Menubar Trigger that applies consistent classes, adds a `data-slot="menubar-trigger"` attribute, and forwards all props.
 *
 * @returns The Menubar Trigger element with the provided `className` merged into the component's base classes and all other props forwarded.
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
 * Renders menubar content inside a portal with default alignment, offsets, and entrance/exit animations.
 *
 * @param className - Additional class names to merge with the component's base styling.
 * @param align - Content alignment relative to the trigger; defaults to `'start'`.
 * @param alignOffset - Pixel offset applied to alignment; defaults to `-4`.
 * @param sideOffset - Pixel offset between the trigger and content; defaults to `8`.
 * @returns The Menubar content element with applied positioning, animations, and merged props.
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
 * Renders a styled menubar item with optional inset spacing and visual variants.
 *
 * @param inset - Whether the item should render with inset spacing (adds left padding).
 * @param variant - Visual variant of the item; `"destructive"` applies destructive styling, `"default"` applies the standard styling.
 * @returns A React element for a menubar item with applied styling and data attributes.
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
 * Renders a styled menubar checkbox item with a left-aligned check indicator.
 *
 * @param className - Additional CSS classes to apply to the root element.
 * @param children - Content displayed inside the menu item.
 * @param checked - Whether the checkbox item is checked.
 * @returns The rendered Menubar checkbox item element.
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
 * Renders a styled menubar radio item with a left-aligned radio indicator.
 *
 * The component forwards all props to Radix's MenubarPrimitive.RadioItem, applies consistent styling,
 * and renders a CircleIcon inside an ItemIndicator positioned to the left of the children.
 *
 * @returns A MenubarPrimitive.RadioItem element with applied classes and an embedded radio indicator.
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
 * Renders a styled label for menubar items.
 *
 * The component forwards all props to the underlying Radix Label and applies
 * consistent spacing and typography. When `inset` is `true`, an extra left
 * offset is applied and a `data-inset` attribute is set.
 *
 * @param inset - If `true`, applies inset padding and sets `data-inset` on the element
 * @returns The rendered menubar label element
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
 * Renders a horizontal separator styled for the menubar.
 *
 * Applies menubar-specific attributes and base border styling, and forwards
 * remaining props to the underlying Radix Separator.
 *
 * @returns A styled menubar separator element.
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
 * Renders a right-aligned, small, muted span for displaying keyboard shortcuts in a menubar.
 *
 * @param className - Additional class names to merge with the default shortcut styling.
 * @returns A span element styled for keyboard shortcut text.
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
 * Renders a Menubar Sub element with a `data-slot="menubar-sub"` attribute and forwards all received props.
 *
 * @returns A React element for a menubar sub that includes the `data-slot` attribute and forwards the provided props.
 */
function MenubarSub({ ...props }: React.ComponentProps<typeof MenubarPrimitive.Sub>) {
  return <MenubarPrimitive.Sub data-slot="menubar-sub" {...props} />;
}

/**
 * Renders a styled menubar sub-trigger with an end chevron and optional inset spacing.
 *
 * @param inset - When `true`, applies inset left padding and sets `data-inset` for styling.
 * @returns A React element representing the menubar sub-trigger.
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
 * Styled wrapper around Radix's Menubar SubContent that applies consistent popup styling, motion classes, and a `data-slot="menubar-sub-content"` attribute.
 *
 * @param className - Additional CSS class names to merge with the component's default styles.
 * @returns A styled Menubar SubContent React element.
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