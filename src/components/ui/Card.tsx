import { ReactNode } from 'react';
import { cn } from '@/utils';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ children, className, onClick }: CardProps) {
  return (
    <div 
      className={cn(
        "bg-white rounded-2xl border border-gray-200 p-4 shadow-sm",
        onClick && "cursor-pointer active:scale-[0.99] transition-transform",
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div className="w-1/2 h-6 bg-gray-200 rounded"></div>
        <div className="w-20 h-6 bg-gray-200 rounded-full"></div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="w-full h-4 bg-gray-100 rounded"></div>
        <div className="w-3/4 h-4 bg-gray-100 rounded"></div>
      </div>
      <div className="flex justify-between pt-2 border-t border-gray-50">
        <div className="w-24 h-4 bg-gray-100 rounded"></div>
        <div className="w-24 h-4 bg-gray-100 rounded"></div>
      </div>
    </div>
  );
}
