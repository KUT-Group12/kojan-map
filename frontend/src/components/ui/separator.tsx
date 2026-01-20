'use client';

import * as React from 'react';
import * as SeparatorPrimitive from '@radix-ui/react-separator';

import { cn } from './utils';

/**
 * Renders a styled separator that wraps Radix's SeparatorPrimitive.Root.
 *
 * @param className - Additional CSS classes to append to the separator's base styles
 * @param orientation - Layout of the separator; `"horizontal"` uses full width and 1px height, `"vertical"` uses full height and 1px width
 * @param decorative - Whether the separator is decorative; forwarded to the underlying primitive
 * @param props - Additional props forwarded to SeparatorPrimitive.Root
 * @returns The rendered separator element
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