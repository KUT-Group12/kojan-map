/* eslint-disable react-refresh/only-export-components */

'use client';

import * as React from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';
import { Slot } from '@radix-ui/react-slot';
import {
  Controller,
  FormProvider,
  useFormContext,
  useFormState,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form';

import { cn } from './utils';
import { Label } from './label';

const Form = FormProvider;

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
};

const FormFieldContext = React.createContext<FormFieldContextValue>({} as FormFieldContextValue);

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
};

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState } = useFormContext();
  const formState = useFormState({ name: fieldContext.name });
  const fieldState = getFieldState(fieldContext.name, formState);

  if (!fieldContext) {
    throw new Error('useFormField should be used within <FormField>');
  }

  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
};

type FormItemContextValue = {
  id: string;
};

const FormItemContext = React.createContext<FormItemContextValue>({} as FormItemContextValue);

/**
 * Supplies a unique item id to descendants via context and renders a styled container for a form item.
 *
 * The generated id is provided through FormItemContext and the component renders a <div> with data-slot="form-item"
 * and default grid spacing; additional div props and className are forwarded.
 *
 * @returns A <div> wrapped in FormItemContext.Provider that provides a generated `id` to descendant components.
 */
function FormItem({ className, ...props }: React.ComponentProps<'div'>) {
  const id = React.useId();

  return (
    <FormItemContext.Provider value={{ id }}>
      <div data-slot="form-item" className={cn('grid gap-2', className)} {...props} />
    </FormItemContext.Provider>
  );
}

/**
 * Renders a form label linked to the current field with error-aware attributes and styling.
 *
 * The label is bound to the form item's input via `htmlFor` and receives `data-error` when the
 * field has a validation error so styles can reflect the error state.
 *
 * @returns A label element associated with the current form item id, with error state reflected in `data-error` and CSS classes.
 */
function FormLabel({ className, ...props }: React.ComponentProps<typeof LabelPrimitive.Root>) {
  const { error, formItemId } = useFormField();

  return (
    <Label
      data-slot="form-label"
      data-error={!!error}
      className={cn('data-[error=true]:text-destructive', className)}
      htmlFor={formItemId}
      {...props}
    />
  );
}

/**
 * Renders a form control slot wired to the current field's IDs and accessibility attributes.
 *
 * The Slot receives an `id` for the form item, an `aria-describedby` that includes the description and
 * (when there is an error) the message, and `aria-invalid` reflecting the field error state.
 *
 * @returns A Slot element configured with `id`, `aria-describedby`, and `aria-invalid` based on the current field state.
 */
function FormControl({ ...props }: React.ComponentProps<typeof Slot>) {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField();

  return (
    <Slot
      data-slot="form-control"
      id={formItemId}
      aria-describedby={!error ? `${formDescriptionId}` : `${formDescriptionId} ${formMessageId}`}
      aria-invalid={!!error}
      {...props}
    />
  );
}

/**
 * Renders a paragraph that provides the form field's descriptive text and is associated with the field via its generated description id for accessibility.
 *
 * @param className - Optional additional class names applied to the paragraph.
 * @returns The rendered paragraph element containing the field description and bound to the field's description id.
 */
function FormDescription({ className, ...props }: React.ComponentProps<'p'>) {
  const { formDescriptionId } = useFormField();

  return (
    <p
      data-slot="form-description"
      id={formDescriptionId}
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  );
}

/**
 * Renders a form field message element showing the field's error message or fallback children, and does not render if there is no message.
 *
 * Uses the surrounding form field context to obtain the current error and message ID. When an error exists the error's `message` is displayed; otherwise the component renders its children. If neither yields content, the component returns `null`.
 *
 * @returns A `<p>` element containing the error message or children, or `null` if there is no message to display.
 */
function FormMessage({ className, ...props }: React.ComponentProps<'p'>) {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error?.message ?? '') : props.children;

  if (!body) {
    return null;
  }

  return (
    <p
      data-slot="form-message"
      id={formMessageId}
      className={cn('text-destructive text-sm', className)}
      {...props}
    >
      {body}
    </p>
  );
}

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
};