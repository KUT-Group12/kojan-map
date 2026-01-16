'use client';

import * as CollapsiblePrimitive from '@radix-ui/react-collapsible';

/**
 * Wraps and renders Radix's Collapsible root element with a fixed data-slot for slot targeting.
 *
 * @returns The rendered CollapsiblePrimitive.Root element with `data-slot="collapsible"` and all received props forwarded.
 */
function Collapsible({ ...props }: React.ComponentProps<typeof CollapsiblePrimitive.Root>) {
  return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />;
}

/**
 * Renders a collapsible trigger element that forwards all received props to the Radix Collapsible trigger primitive.
 *
 * @param props - Props forwarded to the underlying `CollapsiblePrimitive.CollapsibleTrigger`
 * @returns The JSX element for the collapsible trigger
 */
function CollapsibleTrigger({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleTrigger>) {
  return <CollapsiblePrimitive.CollapsibleTrigger data-slot="collapsible-trigger" {...props} />;
}

/**
 * Wraps Radix's CollapsibleContent primitive, forwards all props, and sets a `data-slot="collapsible-content"` attribute.
 *
 * @param props - Props passed through to the underlying `CollapsiblePrimitive.CollapsibleContent`
 * @returns The rendered CollapsibleContent element
 */
function CollapsibleContent({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleContent>) {
  return <CollapsiblePrimitive.CollapsibleContent data-slot="collapsible-content" {...props} />;
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent };