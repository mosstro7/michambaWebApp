const COLORS = [
  'bg-blue-500',
  'bg-teal-500',
  'bg-purple-500',
  'bg-orange-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-green-600',
  'bg-red-500',
  'bg-yellow-600',
  'bg-cyan-600',
];

function hashName(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

function getAvatarColor(name: string): string {
  return COLORS[hashName(name) % COLORS.length];
}

function getInitials(nombre: string, apellido?: string): string {
  const first = nombre?.charAt(0).toUpperCase() || '';
  const last = apellido?.charAt(0).toUpperCase() || '';
  return first + last || '?';
}

const SIZE_CLASSES = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-12 h-12 text-sm',
  lg: 'w-24 h-24 text-2xl',
};

interface AvatarProps {
  nombre: string;
  apellido?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Avatar({ nombre, apellido, size = 'sm', className = '' }: AvatarProps) {
  const initials = getInitials(nombre, apellido);
  const color = getAvatarColor(nombre + (apellido || ''));
  return (
    <div
      className={`${SIZE_CLASSES[size]} ${color} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 ${className}`}
    >
      {initials}
    </div>
  );
}
