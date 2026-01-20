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
 * Render a styled ToggleGroup root and provide `variant` and `size` to its descendants via context.
 *
 * @param className - Additional CSS classes applied to the ToggleGroup root
 * @param variant - Visual variant used to compute styling for the group and its items
 * @param size - Size token used to compute spacing and sizing for the group and its items
 * @param children - Child elements rendered inside the ToggleGroup
 * @returns A React element representing the ToggleGroup root with context-provided `variant` and `size`
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
 * Render a styled toggle-group item whose variant and size are resolved from the surrounding ToggleGroup context when available, otherwise from the component props.
 *
 * @param className - Additional CSS classes to apply to the item
 * @param children - Item contents
 * @param variant - Visual variant for the item; ignored if a variant is provided by the enclosing ToggleGroup context
 * @param size - Size token for the item; ignored if a size is provided by the enclosing ToggleGroup context
 * @returns The rendered ToggleGroup item element
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