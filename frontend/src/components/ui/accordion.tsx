'use client';

import * as React from 'react';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { ChevronDownIcon } from 'lucide-react';

import { cn } from './utils';

/**
 * Renders an accordion root element with a data-slot of "accordion" and forwards all props to the underlying Radix Accordion root.
 *
 * @param props - Props accepted by the Radix Accordion root; all are forwarded to the rendered element.
 * @returns The rendered accordion root element.
 */
function Accordion({ ...props }: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return <AccordionPrimitive.Root data-slot="accordion" {...props} />;
}

/**
 * Renders a Radix Accordion Item with default border styling and a `data-slot="accordion-item"` attribute.
 *
 * @param className - Additional CSS classes to append to the default border styles.
 * @returns A React element representing the accordion item.
 */
function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn('border-b last:border-b-0', className)}
      {...props}
    />
  );
}

/**
 * Renders an Accordion trigger button with built-in styling, focus/hover behavior, and a right-aligned chevron icon that rotates when opened.
 *
 * @param className - Additional CSS classes to merge with the component's default styles.
 * @param children - Content displayed inside the trigger (e.g., title or label).
 * @returns The rendered Accordion trigger element.
 */
function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          'focus-visible:border-ring focus-visible:ring-ring/50 flex flex-1 items-start justify-between gap-4 rounded-md py-4 text-left text-sm font-medium transition-all outline-none hover:underline focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-180',
          className
        )}
        {...props}
      >
        {children}
        <ChevronDownIcon className="text-muted-foreground pointer-events-none size-4 shrink-0 translate-y-0.5 transition-transform duration-200" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

/**
 * Renders the content area for an accordion item with state-driven open/close animations.
 *
 * The outer element receives a `data-slot="accordion-content"` attribute and animation-related classes
 * that respond to the Radix `data-state` attribute. The `children` are wrapped in an inner div that
 * applies vertical padding and any additional `className` provided.
 *
 * @param className - Additional CSS class names applied to the inner wrapper around `children`
 * @param children - Content to display inside the accordion content area
 * @returns The Accordion content element with animated open/close behaviour
 */
function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-sm"
      {...props}
    >
      <div className={cn('pt-0 pb-4', className)}>{children}</div>
    </AccordionPrimitive.Content>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };