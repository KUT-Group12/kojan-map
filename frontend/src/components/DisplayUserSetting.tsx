import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ReactNode } from 'react';

interface DisplayUserSettingProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  titleClassName?: string;
}

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
