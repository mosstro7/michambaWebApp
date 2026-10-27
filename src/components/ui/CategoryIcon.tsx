import * as Icons from 'lucide-react';
import {
  LucideProps,
  LucideIcon,
  Briefcase,
  Sparkles,
  Zap,
  Droplets,
  Paintbrush,
  Leaf,
  Truck,
  Monitor,
  Hammer,
} from 'lucide-react';

interface CategoryIconProps extends LucideProps {
  name: string;
}

export function CategoryIcon({ name, ...props }: CategoryIconProps) {
  // @ts-ignore
  const Icon = Icons[name] || Icons.HelpCircle;
  return <Icon {...props} />;
}

// Ícono por nombre de categoría (los ids reales vienen del backend, el nombre es estable).
const ICON_BY_CATEGORY: Record<string, LucideIcon> = {
  limpieza: Sparkles,
  electricidad: Zap,
  plomeria: Droplets,
  pintura: Paintbrush,
  jardineria: Leaf,
  mudanzas: Truck,
  computacion: Monitor,
  carpinteria: Hammer,
};

function normalize(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase();
}

export function getCategoryIcon(categoryName?: string): LucideIcon {
  return (categoryName && ICON_BY_CATEGORY[normalize(categoryName)]) || Briefcase;
}
