import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  className?: string;
}

export function ErrorMessage({ message, className = '' }: ErrorMessageProps) {
  return (
    <div className={`flex items-center p-4 bg-red-50 border border-red-200 rounded-lg ${className}`}>
      <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
      <p className="text-red-700">{message}</p>
    </div>
  );
}