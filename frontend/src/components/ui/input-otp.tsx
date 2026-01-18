'use client';

import * as React from 'react';
import { OTPInput, OTPInputContext } from 'input-otp';
import { MinusIcon } from 'lucide-react';

import { cn } from './utils';

/**
 * Render an OTPInput with standard layout, accessibility slot, and merged class names.
 *
 * @param className - Additional CSS classes applied to the OTP input elements
 * @param containerClassName - Additional CSS classes applied to the input container
 * @returns A configured OTPInput React element with data-slot "input-otp" and merged container and input class names
 */
function InputOTP({
  className,
  containerClassName,
  ...props
}: React.ComponentProps<typeof OTPInput> & {
  containerClassName?: string;
}) {
  return (
    <OTPInput
      data-slot="input-otp"
      containerClassName={cn('flex items-center gap-2 has-disabled:opacity-50', containerClassName)}
      className={cn('disabled:cursor-not-allowed', className)}
      {...props}
    />
  );
}

/**
 * Renders a horizontal container for grouping OTP input slots.
 *
 * @param className - Additional CSS classes to merge with the container's default layout classes
 * @returns A div element with data-slot="input-otp-group" that lays out its children in a horizontal row
 */
function InputOTPGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="input-otp-group"
      className={cn('flex items-center gap-1', className)}
      {...props}
    />
  );
}

/**
 * Renders a single OTP input slot showing its character and an optional blinking caret when active.
 *
 * @param index - The zero-based position of this slot within the OTP input sequence.
 * @returns A div element representing the OTP slot, containing the slot character and a blinking caret overlay when present.
 */
function InputOTPSlot({
  index,
  className,
  ...props
}: React.ComponentProps<'div'> & {
  index: number;
}) {
  const inputOTPContext = React.useContext(OTPInputContext);
  const { char, hasFakeCaret, isActive } = inputOTPContext?.slots[index] ?? {};

  return (
    <div
      data-slot="input-otp-slot"
      data-active={isActive}
      className={cn(
        'data-[active=true]:border-ring data-[active=true]:ring-ring/50 data-[active=true]:aria-invalid:ring-destructive/20 dark:data-[active=true]:aria-invalid:ring-destructive/40 aria-invalid:border-destructive data-[active=true]:aria-invalid:border-destructive dark:bg-input/30 border-input relative flex h-9 w-9 items-center justify-center border-y border-r text-sm bg-input-background transition-all outline-none first:rounded-l-md first:border-l last:rounded-r-md data-[active=true]:z-10 data-[active=true]:ring-[3px]',
        className
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="animate-caret-blink bg-foreground h-4 w-px duration-1000" />
        </div>
      )}
    </div>
  );
}

/**
 * Renders a separator between OTP input slots.
 *
 * @param props - Props forwarded to the wrapper `div`.
 * @returns A `div` element with `role="separator"`, `data-slot="input-otp-separator"`, and a `MinusIcon` child.
 */
function InputOTPSeparator({ ...props }: React.ComponentProps<'div'>) {
  return (
    <div data-slot="input-otp-separator" role="separator" {...props}>
      <MinusIcon />
    </div>
  );
}

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator };