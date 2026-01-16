'use client';

import * as React from 'react';
import * as SeparatorPrimitive from '@radix-ui/react-separator';

import { cn } from './utils';

/**
 * Render a styled separator element using Radix UI's Separator root.
 *
 * Applies orientation and decorative attributes and merges the provided `className`
 * with the component's base separator classes.
 *
 * @param className - Additional CSS classes to append to the separator's base classes
 * @param orientation - Layout direction of the separator; `'horizontal'` or `'vertical'`
 * @param decorative - Whether the separator is decorative (true) or exposes semantics to assistive technologies (false)
 * @returns The configured SeparatorPrimitive.Root React element
 */
function Separator({
  className,
  orientation = 'horizontal',
  decorative = true,
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator-root"
      decorative={decorative}
      orientation={orientation}
      className={cn(
        'bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px',
        className
      )}
      {...props}
    />
  );
}

export { Separator };