'use client';

import * as AspectRatioPrimitive from '@radix-ui/react-aspect-ratio';

/**
 * Wraps the Radix AspectRatio `Root`, forwarding all received props and setting `data-slot="aspect-ratio"`.
 *
 * @param props - Props to forward to `AspectRatioPrimitive.Root`.
 * @returns A React element rendering `AspectRatioPrimitive.Root` configured with the provided props.
 */
function AspectRatio({ ...props }: React.ComponentProps<typeof AspectRatioPrimitive.Root>) {
  return <AspectRatioPrimitive.Root data-slot="aspect-ratio" {...props} />;
}

export { AspectRatio };