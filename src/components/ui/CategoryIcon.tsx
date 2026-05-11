import * as Icons from 'lucide-react';
import { LucideProps } from 'lucide-react';

interface CategoryIconProps extends LucideProps {
  name: string;
}

export function CategoryIcon({ name, ...props }: CategoryIconProps) {
  // @ts-ignore
  const Icon = Icons[name] || Icons.HelpCircle;
  return <Icon {...props} />;
}
