'use client';

import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';

import { cn } from './utils';

/**
 * Render a Tabs root wrapper that applies default layout styling and a consistent data-slot.
 *
 * The component forwards all props to the underlying Radix Tabs.Root and merges the provided
 * `className` with the default 'flex flex-col gap-2' layout classes.
 *
 * @returns A Tabs root element with default layout classes merged with any provided `className`
 */
function Tabs({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn('flex flex-col gap-2', className)}
      {...props}
    />
  );
}

/**
 * Renders a tabs list element with default styling and a `data-slot="tabs-list"`.
 *
 * Merges any provided `className` with the component's default classes and forwards all other props
 * to the underlying element.
 *
 * @param className - Additional class names to merge with the default styling
 * @param props - Props forwarded to the underlying TabsPrimitive.List element
 * @returns A React element for the styled tabs list with merged class names and forwarded props
 */
function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        'bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-xl p-[3px] flex',
        className
      )}
      {...props}
    />
  );
}

/**
 * Renders a styled wrapper around Radix UI's Tabs Trigger, applying default classes and a `data-slot="tabs-trigger"`.
 *
 * @returns A React element for TabsPrimitive.Trigger with default styling merged with `className` and all props forwarded.
 */
function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "data-[state=active]:bg-card dark:data-[state=active]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 text-foreground dark:text-muted-foreground inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-xl border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  );
}

/**
 * Wraps Radix TabsPrimitive.Content with default styling and a data-slot for consistent slotting.
 *
 * @param className - Additional CSS classes merged with the default 'flex-1 outline-none'
 * @returns The rendered TabsPrimitive.Content element with merged classes and `data-slot="tabs-content"`
 */
function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn('flex-1 outline-none', className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };