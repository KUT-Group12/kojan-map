'use client';

import * as React from 'react';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { ChevronDownIcon } from 'lucide-react';

import { cn } from './utils';

/**
 * Render the Radix Accordion root element with a `data-slot="accordion"` attribute.
 *
 * @param props - Props forwarded to `AccordionPrimitive.Root`.
 * @returns A React element for `AccordionPrimitive.Root` with `data-slot="accordion"` and forwarded props.
 */
function Accordion({ ...props }: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return <AccordionPrimitive.Root data-slot="accordion" {...props} />;
}

/**
 * Renders an accordion item element with default border styles and forwards all props to the underlying primitive.
 *
 * @param className - Additional CSS class names to merge with the component's base classes
 * @returns A React element representing an accordion item with base 'border-b' styling and any provided props applied
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
 * Renders an accordion trigger inside a header that toggles its parent item and displays a chevron icon.
 *
 * @param className - Additional CSS classes to append to the trigger's default class list
 * @param children - Content rendered inside the trigger (label or custom nodes)
 * @param props - Additional props forwarded to the underlying Radix `AccordionPrimitive.Trigger`
 * @returns The rendered accordion trigger element
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
 * Renders an accordion content panel with open/close animations and a padded inner container.
 *
 * @param className - Additional CSS classes applied to the inner content wrapper
 * @param children - Elements rendered inside the accordion panel
 * @param props - Props forwarded to the underlying `AccordionPrimitive.Content` element
 * @returns A React element representing the accordion content panel
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