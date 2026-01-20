'use client';

import * as React from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';

import { cn } from './utils';

/**
 * Renders a styled wrapper around Radix UI's Label primitive.
 *
 * @param className - Additional CSS class names to merge with the component's default classes
 * @param props - All other props are forwarded to the underlying LabelPrimitive.Root
 * @returns A React element for a label with merged class names and a `data-slot="label"` attribute
 */
function Label({ className, ...props }: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        'flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
        className
      )}
      {...props}
    />
  );
}

export { Label };