import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: 'OK' | 'NOT_OK';
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const isOk = status === 'OK';
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-1' : 'text-sm px-3 py-1';
  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${sizeClasses} ${
        isOk
          ? 'bg-green-100 text-green-800'
          : 'bg-red-100 text-red-800'
      }`}
    >
      {isOk ? (
        <CheckCircle className={`${iconSize} mr-1`} />
      ) : (
        <XCircle className={`${iconSize} mr-1`} />
      )}
      {isOk ? 'OK' : 'NOT OK'}
    </span>
  );
}