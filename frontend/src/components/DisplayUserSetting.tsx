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
 * Render a settings card with a title, optional description, and custom content.
 *
 * @param title - The title text shown in the card header
 * @param description - Optional descriptive text shown below the title
 * @param children - Content rendered inside the card body
 * @param className - Optional CSS class(es) applied to the root card element
 * @param titleClassName - Optional CSS class(es) applied to the title element
 * @returns A JSX element representing the composed settings card
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