'use client';

import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';

import { cn } from './utils';

/**
 * Provides a Radix TooltipProvider with data-slot "tooltip-provider" and configurable show delay.
 *
 * @param delayDuration - Time in milliseconds to wait before showing the tooltip; defaults to 0.
 * @returns The TooltipPrimitive.Provider element with the supplied props applied.
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
 * Wraps the Radix Tooltip Root with a TooltipProvider to ensure provider context.
 *
 * @param props - Props forwarded to the underlying TooltipPrimitive.Root.
 * @returns The TooltipPrimitive.Root element wrapped in a TooltipProvider.
 */
function Tooltip({ ...props }: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return (
    <TooltipProvider>
      <TooltipPrimitive.Root data-slot="tooltip" {...props} />
    </TooltipProvider>
  );
}

/**
 * Renders a Radix tooltip trigger element with a data-slot attribute for styling and selection.
 *
 * @param props - Props forwarded to the underlying Radix `TooltipPrimitive.Trigger` element
 * @returns A React element that renders the tooltip trigger
 */
function TooltipTrigger({ ...props }: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

/**
 * Renders tooltip content inside a portal with default styling and an arrow.
 *
 * The content is wrapped in a Radix Portal and Content component, applies the library's
 * default tooltip styles (which can be extended via `className`), and includes a positioned arrow.
 *
 * @param className - Additional CSS classes to merge with the component's default styles.
 * @param sideOffset - Distance, in pixels, to offset the content from the trigger on the active side.
 * @param children - Elements to render inside the tooltip content.
 * @returns A React element representing the styled tooltip content rendered in a portal with an arrow.
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