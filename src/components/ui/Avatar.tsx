import { useState } from 'react';

// Tonos 700 de Tailwind: todos con contraste >= 4.5:1 contra texto blanco (WCAG AA).
// Se aplican como color inline para no depender de que Tailwind detecte clases dinámicas.
const COLORS = [
  '#0F766E', // teal
  '#1D4ED8', // blue
  '#6D28D9', // violet
  '#BE185D', // pink
  '#C2410C', // orange
  '#047857', // emerald
  '#4338CA', // indigo
  '#475569', // slate
];

// FNV-1a 32 bits: distribuye bien incluso con nombres cortos o parecidos.
function hashName(name: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < name.length; i++) {
    hash ^= name.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

function normalize(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase();
}

function getAvatarColor(fullName: string): string {
  return COLORS[hashName(normalize(fullName)) % COLORS.length];
}

function getInitials(nombre: string, apellido?: string): string {
  const words = `${nombre ?? ''} ${apellido ?? ''}`.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  const first = words[0].charAt(0);
  const last = apellido?.trim() ? apellido.trim().charAt(0) : words[1]?.charAt(0) ?? '';
  return (first + last).toUpperCase();
}

const SIZE_CLASSES = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-12 h-12 text-sm',
  lg: 'w-24 h-24 text-2xl',
};

interface AvatarProps {
  nombre: string;
  apellido?: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Avatar({ nombre, apellido, src, size = 'sm', className = '' }: AvatarProps) {
  const [imgError, setImgError] = useState(false);
  const fullName = `${nombre ?? ''} ${apellido ?? ''}`.trim();
  const baseClasses = `${SIZE_CLASSES[size]} rounded-full flex-shrink-0 ${className}`;

  if (src && !imgError) {
    return (
      <img
        src={src}
        alt={fullName || 'Avatar'}
        onError={() => setImgError(true)}
        className={`${baseClasses} object-cover`}
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={fullName || 'Usuario'}
      style={{ backgroundColor: getAvatarColor(fullName) }}
      className={`${baseClasses} flex items-center justify-center text-white font-bold select-none`}
    >
      {getInitials(nombre, apellido)}
    </div>
  );
}
