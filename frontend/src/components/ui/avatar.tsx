'use client';

import * as React from 'react';
import * as AvatarPrimitive from '@radix-ui/react-avatar';

import { cn } from './utils';

/**
 * Renders the avatar root element with base avatar styling and optional additional classes.
 *
 * @param className - Additional class names merged with the component's base avatar classes
 * @param props - Additional props forwarded to `AvatarPrimitive.Root`
 * @returns The `AvatarPrimitive.Root` element with combined classes and `data-slot="avatar"`
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
 * Renders an avatar image element using Radix Avatar's Image primitive.
 *
 * @returns A Radix Avatar Image element with `data-slot="avatar-image"` and combined classes (`aspect-square size-full` plus any `className` passed).
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
 * Renders the Avatar fallback element shown when avatar image content is unavailable.
 *
 * @returns The Radix Avatar.Fallback element with default avatar styling and any additional `className` or props applied.
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