'use client';

import * as CollapsiblePrimitive from '@radix-ui/react-collapsible';

/**
 * Renders a Radix Collapsible root element with a `data-slot="collapsible"` attribute and forwards all received props.
 *
 * @param props - Props to pass through to `CollapsiblePrimitive.Root`
 * @returns A `CollapsiblePrimitive.Root` element with the provided props and `data-slot="collapsible"`
 */
function Collapsible({ ...props }: React.ComponentProps<typeof CollapsiblePrimitive.Root>) {
  return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />;
}

/**
 * Renders a Radix Collapsible trigger element with a data-slot attribute of "collapsible-trigger".
 *
 * @param props - Props forwarded to the underlying CollapsiblePrimitive.CollapsibleTrigger element
 * @returns The rendered trigger element
 */
function CollapsibleTrigger({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleTrigger>) {
  return <CollapsiblePrimitive.CollapsibleTrigger data-slot="collapsible-trigger" {...props} />;
}

/**
 * Renders a Radix CollapsibleContent element with a fixed `data-slot="collapsible-content"`.
 *
 * @param props - Props forwarded to `CollapsiblePrimitive.CollapsibleContent`
 * @returns The rendered `CollapsiblePrimitive.CollapsibleContent` element with `data-slot="collapsible-content"`.
 */
function CollapsibleContent({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleContent>) {
  return <CollapsiblePrimitive.CollapsibleContent data-slot="collapsible-content" {...props} />;
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent };