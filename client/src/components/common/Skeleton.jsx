import React from 'react';

export function PostSkeleton() {
  return (
    <div className="glass-card p-5 space-y-4 animate-pulse">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800" />
        <div className="space-y-1.5 flex-1">
          <div className="w-32 h-3.5 rounded bg-gray-200 dark:bg-gray-800" />
          <div className="w-20 h-2.5 rounded bg-gray-200 dark:bg-gray-800" />
        </div>
      </div>

      {/* Content lines */}
      <div className="space-y-2">
        <div className="w-full h-3.5 rounded bg-gray-200 dark:bg-gray-800" />
        <div className="w-5/6 h-3.5 rounded bg-gray-200 dark:bg-gray-800" />
        <div className="w-2/3 h-3.5 rounded bg-gray-200 dark:bg-gray-800" />
      </div>

      {/* Image placeholder */}
      <div className="w-full h-64 rounded-xl bg-gray-200 dark:bg-gray-800" />

      {/* Action buttons */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-white/[0.05]">
        <div className="flex gap-4">
          <div className="w-16 h-5 rounded bg-gray-200 dark:bg-gray-800" />
          <div className="w-16 h-5 rounded bg-gray-200 dark:bg-gray-800" />
        </div>
        <div className="w-8 h-5 rounded bg-gray-200 dark:bg-gray-800" />
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="glass-card overflow-hidden animate-pulse">
      <div className="w-full h-44 bg-gray-200 dark:bg-gray-800" />
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-end -mt-16">
          <div className="w-24 h-24 rounded-full ring-4 ring-white dark:ring-dark-bg bg-gray-300 dark:bg-gray-700" />
          <div className="w-28 h-9 rounded-xl bg-gray-200 dark:bg-gray-800" />
        </div>
        <div className="space-y-2 pt-2">
          <div className="w-48 h-5 rounded bg-gray-200 dark:bg-gray-800" />
          <div className="w-32 h-3.5 rounded bg-gray-200 dark:bg-gray-800" />
          <div className="w-full h-12 rounded bg-gray-200 dark:bg-gray-800" />
        </div>
        <div className="flex gap-6 pt-3 border-t border-gray-100 dark:border-white/[0.05]">
          <div className="w-20 h-4 rounded bg-gray-200 dark:bg-gray-800" />
          <div className="w-20 h-4 rounded bg-gray-200 dark:bg-gray-800" />
          <div className="w-20 h-4 rounded bg-gray-200 dark:bg-gray-800" />
        </div>
      </div>
    </div>
  );
}
