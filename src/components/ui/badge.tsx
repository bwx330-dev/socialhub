'use client';

import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

const variantStyles = {
  success: 'bg-[#3fb950]/15 text-[#3fb950] border-[#3fb950]/30',
  warning: 'bg-[#d29922]/15 text-[#d29922] border-[#d29922]/30',
  danger: 'bg-[#da3633]/15 text-[#da3633] border-[#da3633]/30',
  info: 'bg-[#58a6ff]/15 text-[#58a6ff] border-[#58a6ff]/30',
};

export function Badge({ children, variant = 'info', className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
