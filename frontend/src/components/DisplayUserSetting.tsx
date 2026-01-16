import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ReactNode } from 'react';

interface DisplayUserSettingProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  titleClassName?: string;
}

/**
 * Render a labeled user setting card with an optional description and customizable styling.
 *
 * @param title - Primary label text displayed in the card header
 * @param description - Optional secondary text shown under the title
 * @param children - Content displayed inside the card body (e.g., input or control)
 * @param className - Optional CSS class applied to the outer Card container
 * @param titleClassName - Optional CSS class applied to the CardTitle element
 * @returns The rendered setting card element
 */
export function DisplayUserSetting({
  title,
  description,
  children,
  className,
  titleClassName,
}: DisplayUserSettingProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className={titleClassName}>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}