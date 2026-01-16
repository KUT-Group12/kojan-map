'use client';

import * as React from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';

import { cn } from './utils';

/**
 * Renders a styled label element with built-in disabled-state and peer-responsive styles.
 *
 * Forwards all props to the underlying label primitive, applies data-slot="label", and
 * merges any provided `className` with the component's default utility classes.
 *
 * @param className - Additional CSS class names to append to the default classes
 * @returns The rendered label React element
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