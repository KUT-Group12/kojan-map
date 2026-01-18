'use client';

import * as React from 'react';
import * as ContextMenuPrimitive from '@radix-ui/react-context-menu';
import { CheckIcon, ChevronRightIcon, CircleIcon } from 'lucide-react';

import { cn } from './utils';

/**
 * Context menu root wrapper that forwards all props to the underlying Radix ContextMenu.Root and sets a data-slot.
 *
 * @param props - Props forwarded to the Radix `ContextMenu.Root`
 * @returns The rendered `ContextMenu.Root` element with `data-slot="context-menu"`
 */
function ContextMenu({ ...props }: React.ComponentProps<typeof ContextMenuPrimitive.Root>) {
  return <ContextMenuPrimitive.Root data-slot="context-menu" {...props} />;
}

/**
 * Renders a context-menu trigger element that forwards all Trigger props and applies a project-specific data-slot.
 *
 * @returns A ContextMenuPrimitive.Trigger element with data-slot="context-menu-trigger" and forwarded props
 */
function ContextMenuTrigger({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Trigger>) {
  return <ContextMenuPrimitive.Trigger data-slot="context-menu-trigger" {...props} />;
}

/**
 * Renders a context menu group element augmented with the project's data-slot attribute.
 *
 * @returns A Context Menu Group element with data-slot="context-menu-group" and all forwarded props.
 */
function ContextMenuGroup({ ...props }: React.ComponentProps<typeof ContextMenuPrimitive.Group>) {
  return <ContextMenuPrimitive.Group data-slot="context-menu-group" {...props} />;
}

/**
 * Wraps Radix UI's ContextMenuPrimitive.Portal and applies the project-specific `data-slot`.
 *
 * @returns A Portal element with `data-slot="context-menu-portal"` and all provided props forwarded to it.
 */
function ContextMenuPortal({ ...props }: React.ComponentProps<typeof ContextMenuPrimitive.Portal>) {
  return <ContextMenuPrimitive.Portal data-slot="context-menu-portal" {...props} />;
}

/**
 * Wraps Radix UI's ContextMenuPrimitive.Sub and adds the component-specific data-slot attribute.
 *
 * @returns A JSX element rendering a ContextMenu `Sub` component with `data-slot="context-menu-sub"` and all provided props forwarded.
 */
function ContextMenuSub({ ...props }: React.ComponentProps<typeof ContextMenuPrimitive.Sub>) {
  return <ContextMenuPrimitive.Sub data-slot="context-menu-sub" {...props} />;
}

/**
 * Renders a ContextMenu radio group element configured for the project's slot system.
 *
 * @returns A RadioGroup element that forwards all received props and includes data-slot="context-menu-radio-group".
 */
function ContextMenuRadioGroup({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.RadioGroup>) {
  return <ContextMenuPrimitive.RadioGroup data-slot="context-menu-radio-group" {...props} />;
}

/**
 * Renders a context-menu submenu trigger with project-specific data attributes and default styling.
 *
 * @param inset - If true, applies inset spacing and sets the `data-inset` attribute on the trigger.
 * @returns The configured SubTrigger element for activating a submenu.
 */
function ContextMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.SubTrigger> & {
  inset?: boolean;
}) {
  return (
    <ContextMenuPrimitive.SubTrigger
      data-slot="context-menu-sub-trigger"
      data-inset={inset}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto" />
    </ContextMenuPrimitive.SubTrigger>
  );
}

/**
 * Renders a styled wrapper around Radix ContextMenu SubContent for submenu panels.
 *
 * Merges the provided `className` with the component's default styling, sets
 * `data-slot="context-menu-sub-content"`, and forwards all other SubContent props.
 *
 * @param className - Optional additional CSS class names to merge with the default styles
 * @param props - All other props are passed through to the underlying SubContent component
 * @returns A React element representing the submenu content
 */
function ContextMenuSubContent({
  className,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.SubContent>) {
  return (
    <ContextMenuPrimitive.SubContent
      data-slot="context-menu-sub-content"
      className={cn(
        'bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[8rem] origin-(--radix-context-menu-content-transform-origin) overflow-hidden rounded-md border p-1 shadow-lg',
        className
      )}
      {...props}
    />
  );
}

/**
 * Renders the context menu content inside a Radix Portal with project-specific
 * data-slot and default styling classes; merges any provided `className`.
 *
 * @param className - Additional class names to merge with the component's default styles
 * @param props - Additional props forwarded to the underlying Radix `ContextMenuPrimitive.Content`
 * @returns The rendered context menu content element
 */
function ContextMenuContent({
  className,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Content>) {
  return (
    <ContextMenuPrimitive.Portal>
      <ContextMenuPrimitive.Content
        data-slot="context-menu-content"
        className={cn(
          'bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 max-h-(--radix-context-menu-content-available-height) min-w-[8rem] origin-(--radix-context-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border p-1 shadow-md',
          className
        )}
        {...props}
      />
    </ContextMenuPrimitive.Portal>
  );
}

/**
 * Renders a styled context menu item with optional inset spacing and a selectable visual variant.
 *
 * @param className - Additional CSS classes to merge with the component's default styles.
 * @param inset - When `true`, applies inset padding to align a leading indicator or nested content.
 * @param variant - Visual variant of the item; `"destructive"` applies destructive styling, `"default"` applies normal styling.
 * @returns The rendered ContextMenuPrimitive.Item element configured with project-specific data attributes and styling.
 */
function ContextMenuItem({
  className,
  inset,
  variant = 'default',
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Item> & {
  inset?: boolean;
  variant?: 'default' | 'destructive';
}) {
  return (
    <ContextMenuPrimitive.Item
      data-slot="context-menu-item"
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
 * Renders a styled context-menu checkbox item that displays a check indicator when checked.
 *
 * @param checked - Whether the checkbox item is checked.
 * @returns The rendered checkbox menu item element.
 */
function ContextMenuCheckboxItem({
  className,
  children,
  checked,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.CheckboxItem>) {
  return (
    <ContextMenuPrimitive.CheckboxItem
      data-slot="context-menu-checkbox-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      checked={checked}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <ContextMenuPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </ContextMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.CheckboxItem>
  );
}

/**
 * Context menu radio item component that renders a selectable option with a left radio indicator.
 *
 * Renders a Radix `RadioItem` augmented with project styling, a left-aligned radio `ItemIndicator`, and forwarded props.
 *
 * @returns The rendered context menu radio item element
 */
function ContextMenuRadioItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.RadioItem>) {
  return (
    <ContextMenuPrimitive.RadioItem
      data-slot="context-menu-radio-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <ContextMenuPrimitive.ItemIndicator>
          <CircleIcon className="size-2 fill-current" />
        </ContextMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.RadioItem>
  );
}

/**
 * Render a styled label for context menu items with project-specific data attributes.
 *
 * @param inset - When `true`, applies inset spacing (adds left padding) to align with item icons.
 * @returns The configured ContextMenuPrimitive.Label element with data-slot and styling applied.
 */
function ContextMenuLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Label> & {
  inset?: boolean;
}) {
  return (
    <ContextMenuPrimitive.Label
      data-slot="context-menu-label"
      data-inset={inset}
      className={cn('text-foreground px-2 py-1.5 text-sm font-medium data-[inset]:pl-8', className)}
      {...props}
    />
  );
}

/**
 * Renders a styled context menu separator with project-standard data-slot and base classes.
 *
 * @param className - Additional CSS classes appended to the component's default classes
 * @returns The rendered ContextMenu separator element
 */
function ContextMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Separator>) {
  return (
    <ContextMenuPrimitive.Separator
      data-slot="context-menu-separator"
      className={cn('bg-border -mx-1 my-1 h-px', className)}
      {...props}
    />
  );
}

/**
 * Renders a right-aligned keyboard shortcut element for context menu items.
 *
 * @returns A span element containing the shortcut text, styled with utility classes and marked with `data-slot="context-menu-shortcut"`.
 */
function ContextMenuShortcut({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="context-menu-shortcut"
      className={cn('text-muted-foreground ml-auto text-xs tracking-widest', className)}
      {...props}
    />
  );
}

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
};