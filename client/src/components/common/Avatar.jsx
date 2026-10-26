import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export function Avatar({
  src,
  alt = 'User',
  size = 'md',
  isVerified = false,
  className = '',
  onClick,
}) {
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg',
    xl: 'w-24 h-24 text-2xl',
  };

  const badgeSizeClasses = {
    xs: 'w-2.5 h-2.5 -right-0.5 -bottom-0.5',
    sm: 'w-3 h-3 -right-0.5 -bottom-0.5',
    md: 'w-3.5 h-3.5 -right-0.5 -bottom-0.5',
    lg: 'w-4 h-4 right-0 bottom-0',
    xl: 'w-6 h-6 right-1 bottom-1',
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div
      onClick={onClick}
      className={`relative inline-block shrink-0 rounded-full select-none ${
        onClick ? 'cursor-pointer hover:opacity-90' : ''
      } ${className}`}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          className={`${sizeClasses[size]} rounded-full object-cover ring-2 ring-violet-500/20 dark:ring-violet-500/30`}
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            if (e.currentTarget.nextSibling) {
              e.currentTarget.nextSibling.style.display = 'flex';
            }
          }}
        />
      ) : null}

      {/* Fallback initials if image fails or is missing */}
      <div
        style={{ display: src ? 'none' : 'flex' }}
        className={`${sizeClasses[size]} rounded-full bg-gradient-to-tr from-violet-600 via-indigo-600 to-pink-500 text-white font-bold items-center justify-center ring-2 ring-violet-500/20`}
      >
        {getInitials(alt)}
      </div>

      {isVerified && (
        <CheckCircle2
          className={`absolute ${badgeSizeClasses[size]} text-violet-500 fill-white dark:fill-dark-bg`}
        />
      )}
    </div>
  );
}
