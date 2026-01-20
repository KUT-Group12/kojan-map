'use client';

import * as React from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';

import { cn } from './utils';

/**
 * Render a Popover root element with a `data-slot="popover"` attribute and forwarded props.
 *
 * @param props - Props to apply to the underlying Popover root element; all received props are forwarded unchanged.
 * @returns A React element for the Popover root with `data-slot="popover"` and the provided props applied.
 */
function Popover({ ...props }: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}

/**
 * Renders a popover trigger element and forwards received props to the underlying trigger component.
 *
 * @param props - Props passed through to the trigger element; any valid attributes for the underlying trigger are accepted.
 * @returns The rendered popover trigger React element.
 */
function PopoverTrigger({ ...props }: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}

/**
 * Renders popover content inside a portal with default alignment, offset, and preset styling.
 *
 * @param className - Additional CSS classes to merge with the component's preset styles.
 * @param align - Horizontal alignment of the content relative to the trigger. Defaults to `'center'`.
 * @param sideOffset - Distance in pixels between the trigger and the content. Defaults to `4`.
 * @returns A PopoverPrimitive.Content element wrapped in a PopoverPrimitive.Portal with merged class names and forwarded props.
 */
function PopoverContent({
  className,
  align = 'center',
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          'bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-72 origin-(--radix-popover-content-transform-origin) rounded-md border p-4 shadow-md outline-hidden',
          className
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
}

/**
 * Renders a Radix Popover Anchor with a `data-slot="popover-anchor"` attribute and forwards all props.
 *
 * @param props - Props compatible with `PopoverPrimitive.Anchor`; all props are forwarded to the underlying element.
 * @returns The rendered `PopoverPrimitive.Anchor` element.
 */
function PopoverAnchor({ ...props }: React.ComponentProps<typeof PopoverPrimitive.Anchor>) {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />;
}

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor };