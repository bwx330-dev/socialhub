'use client';

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-sm font-medium text-[#e6edf3]"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full rounded-xl border border-[#30363d] bg-[#21262d] px-4 py-2.5 text-sm text-[#e6edf3] placeholder-[#8b949e] outline-none transition-all duration-200 focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff]/30 ${className}`}
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = 'Input';
