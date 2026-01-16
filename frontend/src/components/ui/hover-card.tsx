'use client';

import * as React from 'react';
import * as HoverCardPrimitive from '@radix-ui/react-hover-card';

import { cn } from './utils';

/**
 * Wraps the Radix HoverCard Root and forwards all received props.
 *
 * @param props - Props to pass to the underlying HoverCard root; `data-slot="hover-card"` is applied.
 * @returns The rendered HoverCard root element.
 */
function HoverCard({ ...props }: React.ComponentProps<typeof HoverCardPrimitive.Root>) {
  return <HoverCardPrimitive.Root data-slot="hover-card" {...props} />;
}

/**
 * Renders a hover card trigger element that forwards received props and adds a stable data-slot hook.
 *
 * @param props - Props passed to the underlying HoverCard trigger; all props are forwarded to the trigger element.
 * @returns A React element for the hover card trigger with the `data-slot="hover-card-trigger"` attribute applied.
 */
function HoverCardTrigger({ ...props }: React.ComponentProps<typeof HoverCardPrimitive.Trigger>) {
  return <HoverCardPrimitive.Trigger data-slot="hover-card-trigger" {...props} />;
}

/**
 * Renders the HoverCard content inside a portal with preset styling and animations.
 *
 * The component mounts a HoverCard content element with a data-slot hook, applies default
 * alignment and offset, composes the default styling with any additional `className`, and
 * forwards all other props to the underlying Radix HoverCard Content primitive.
 *
 * @param className - Additional CSS class names to append to the default style
 * @param align - Alignment of the content relative to the trigger; defaults to `'center'`
 * @param sideOffset - Distance in pixels between the trigger and the content; defaults to `4`
 * @returns The rendered HoverCard content element
 */
function HoverCardContent({
  className,
  align = 'center',
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof HoverCardPrimitive.Content>) {
  return (
    <HoverCardPrimitive.Portal data-slot="hover-card-portal">
      <HoverCardPrimitive.Content
        data-slot="hover-card-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          'bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-64 origin-(--radix-hover-card-content-transform-origin) rounded-md border p-4 shadow-md outline-hidden',
          className
        )}
        {...props}
      />
    </HoverCardPrimitive.Portal>
  );
}

export { HoverCard, HoverCardTrigger, HoverCardContent };