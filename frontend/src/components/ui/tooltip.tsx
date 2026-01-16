'use client';

import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';

import { cn } from './utils';

/**
 * Wraps and renders a Radix TooltipProvider with a configurable delayDuration.
 *
 * @param delayDuration - Delay in milliseconds before the tooltip opens or closes. Defaults to 0.
 * @returns The TooltipProvider React element with `data-slot="tooltip-provider"`.
 */
function TooltipProvider({
  delayDuration = 0,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  );
}

/**
 * Wraps Radix's TooltipRoot in the package's TooltipProvider to ensure a consistent provider context.
 *
 * @param props - Props forwarded to Radix TooltipRoot
 * @returns The TooltipRoot element wrapped by TooltipProvider
 */
function Tooltip({ ...props }: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return (
    <TooltipProvider>
      <TooltipPrimitive.Root data-slot="tooltip" {...props} />
    </TooltipProvider>
  );
}

/**
 * Renders a tooltip trigger element and forwards all received props to the underlying trigger.
 *
 * The rendered element always includes `data-slot="tooltip-trigger"` to support styling and automated selection.
 *
 * @param props - Props passed through to the underlying TooltipPrimitive.Trigger
 * @returns The rendered tooltip trigger element
 */
function TooltipTrigger({ ...props }: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

/**
 * Renders tooltip content inside a portal with a styled container and an attached arrow.
 *
 * @param className - Additional CSS classes to merge with the component's default styling.
 * @param sideOffset - Distance in pixels between the trigger and the tooltip content (defaults to 0).
 * @param children - Content to display inside the tooltip.
 * @returns A React element representing the tooltip content wrapped in a portal, with merged classes, applied side offset, and an arrow element.
 */
function TooltipContent({
  className,
  sideOffset = 0,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          'bg-primary text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-fit origin-(--radix-tooltip-content-transform-origin) rounded-md px-3 py-1.5 text-xs text-balance',
          className
        )}
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow className="bg-primary fill-primary z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]" />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };