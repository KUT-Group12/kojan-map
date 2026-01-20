'use client';

import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';

import { cn } from './utils';

/**
 * Renders a Tabs root element with preset layout and gap styling.
 *
 * @param className - Additional CSS class names to merge with the component's default classes.
 * @param props - Props forwarded to the underlying `TabsPrimitive.Root`.
 * @returns The Tabs root element with merged `className` and forwarded props.
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
 * Renders a TabsPrimitive.List wrapper with a preset `data-slot` attribute and default styling.
 *
 * @param className - Additional CSS classes to merge with the component's default classes.
 * @returns The configured `TabsPrimitive.List` element with merged `className` and any forwarded props.
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
 * Renders a styled tabs trigger element with preset classes and a `data-slot="tabs-trigger"` attribute.
 *
 * @param className - Additional CSS class names to merge with the component's default styling.
 * @returns The configured Radix `Tabs.Trigger` element with merged `className` and forwarded props.
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
 * Renders a Tabs content panel with a preset `data-slot` and base styling.
 *
 * @param className - Additional class names merged with the component's base classes.
 * @returns The rendered Tabs content element with merged class names and forwarded props.
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