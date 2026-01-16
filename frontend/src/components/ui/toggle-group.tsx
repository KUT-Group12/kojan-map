'use client';

import * as React from 'react';
import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group';
import { type VariantProps } from 'class-variance-authority';

import { cn } from './utils';
import { toggleVariants } from './toggle';

const ToggleGroupContext = React.createContext<VariantProps<typeof toggleVariants>>({
  size: 'default',
  variant: 'default',
});

/**
 * Renders a themed toggle group root and provides variant/size context to its items.
 *
 * Renders a Radix ToggleGroup Root element with data attributes for `variant` and `size`,
 * applies composed class names, and supplies the resolved `variant` and `size` via context
 * to descendant ToggleGroupItem components.
 *
 * @param className - Additional CSS classes to apply to the toggle group container.
 * @param variant - Visual variant to apply to the group and its items (e.g., "default", "outline").
 * @param size - Size variant to apply to the group and its items (e.g., "default", "sm", "lg").
 * @param children - Child elements (typically ToggleGroupItem instances).
 * @returns The rendered ToggleGroup root element.
 */
function ToggleGroup({
  className,
  variant,
  size,
  children,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Root> & VariantProps<typeof toggleVariants>) {
  return (
    <ToggleGroupPrimitive.Root
      data-slot="toggle-group"
      data-variant={variant}
      data-size={size}
      className={cn(
        'group/toggle-group flex w-fit items-center rounded-md data-[variant=outline]:shadow-xs',
        className
      )}
      {...props}
    >
      <ToggleGroupContext.Provider value={{ variant, size }}>
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive.Root>
  );
}

/**
 * Render a toggle group item that uses the group's variant/size when available or falls back to its own props.
 *
 * Renders a Radix ToggleGroup.Item with data attributes and classes derived from the resolved `variant` and `size`.
 *
 * @param className - Additional CSS classes to apply to the item
 * @param children - Content rendered inside the toggle item
 * @param variant - Visual variant for the item; used when the context does not provide a variant
 * @param size - Size for the item; used when the context does not provide a size
 * @returns A configured ToggleGroup.Item element with appropriate data attributes and composed class names
 */
function ToggleGroupItem({
  className,
  children,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Item> & VariantProps<typeof toggleVariants>) {
  const context = React.useContext(ToggleGroupContext);

  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      data-variant={context.variant || variant}
      data-size={context.size || size}
      className={cn(
        toggleVariants({
          variant: context.variant || variant,
          size: context.size || size,
        }),
        'min-w-0 flex-1 shrink-0 rounded-none shadow-none first:rounded-l-md last:rounded-r-md focus:z-10 focus-visible:z-10 data-[variant=outline]:border-l-0 data-[variant=outline]:first:border-l',
        className
      )}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  );
}

export { ToggleGroup, ToggleGroupItem };