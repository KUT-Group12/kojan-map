'use client';

import * as React from 'react';
import * as AvatarPrimitive from '@radix-ui/react-avatar';

import { cn } from './utils';

/**
 * Renders a styled Avatar root element that wraps Radix UI's AvatarPrimitive.Root.
 *
 * The rendered element includes a `data-slot="avatar"` attribute and applies base
 * avatar styles; any `className` provided will be merged with those styles.
 *
 * @param className - Additional class names to merge with the component's base styles
 * @returns The AvatarPrimitive.Root element with merged classes and forwarded props
 */
function Avatar({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Root>) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn('relative flex size-10 shrink-0 overflow-hidden rounded-full', className)}
      {...props}
    />
  );
}

/**
 * Renders an avatar image element with base sizing and a semantic `data-slot`.
 *
 * Additional `className` values are appended to the component's default classes; all other props are forwarded to the underlying image element.
 *
 * @param className - Extra CSS class names to apply on top of the default styles
 * @param props - Remaining props forwarded to the underlying Avatar image primitive
 * @returns The rendered avatar image element
 */
function AvatarImage({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn('aspect-square size-full', className)}
      {...props}
    />
  );
}

/**
 * Renders a fallback avatar element displayed when an avatar image cannot be shown.
 *
 * @param className - Additional CSS class names to apply to the fallback container
 * @returns A React element representing the avatar fallback content
 */
function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn('bg-muted flex size-full items-center justify-center rounded-full', className)}
      {...props}
    />
  );
}

export { Avatar, AvatarImage, AvatarFallback };