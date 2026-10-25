'use client';

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const variantStyles = {
  primary:
    'bg-[#58a6ff] text-white hover:bg-[#79b8ff] active:bg-[#388bfd] shadow-lg shadow-[#58a6ff]/20',
  secondary:
    'bg-[#21262d] text-[#e6edf3] border border-[#30363d] hover:bg-[#30363d] hover:border-[#8b949e]',
  danger:
    'bg-[#da3633] text-white hover:bg-[#f85149] active:bg-[#b62324] shadow-lg shadow-[#da3633]/20',
  ghost:
    'bg-transparent text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#21262d]',
};

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-4 py-2.5 text-sm rounded-xl',
  lg: 'px-6 py-3 text-base rounded-xl',
};

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
