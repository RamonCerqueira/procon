import React from 'react';
import { cn } from '../../utils/cn';
import { User } from 'lucide-react';

interface AvatarProps {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Avatar({ src, alt, fallback, size = 'md', className }: AvatarProps) {
  const sizes = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-16 w-16 text-lg',
  };

  return (
    <div
      className={cn(
        'relative flex shrink-0 overflow-hidden rounded-full bg-gray-100',
        sizes[size],
        className
      )}
      role="img"
      aria-label={alt || "Avatar do usuário"}
    >
      {src ? (
        <img
          className="aspect-square h-full w-full object-cover"
          src={src}
          alt={alt || ""}
          aria-hidden="true"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-gray-500 font-medium" aria-hidden="true">
          {fallback ? fallback : <User className="h-1/2 w-1/2" />}
        </div>
      )}
    </div>
  );
}
