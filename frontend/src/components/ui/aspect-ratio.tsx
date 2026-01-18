'use client';

import * as AspectRatioPrimitive from '@radix-ui/react-aspect-ratio';

/**
 * Renders an AspectRatioPrimitive.Root container with a `data-slot="aspect-ratio"` attribute and forwards all received props.
 *
 * @param props - Props to forward to AspectRatioPrimitive.Root
 * @returns A React element representing an aspect-ratio container
 */
function AspectRatio({ ...props }: React.ComponentProps<typeof AspectRatioPrimitive.Root>) {
  return <AspectRatioPrimitive.Root data-slot="aspect-ratio" {...props} />;
}

export { AspectRatio };