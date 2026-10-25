import React from 'react';

export function Instagram({ className = 'h-5 w-5', ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export function TikTok({ className = 'h-5 w-5', ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      {...props}
    >
      <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.068-.114a2.896 2.896 0 0 1 2.373-4.501c.218 0 .432.024.638.071V9.375a6.34 6.34 0 0 0-.638-.033A6.341 6.341 0 0 0 3.136 15.68a6.341 6.341 0 0 0 9.878 5.253l.115-.084a6.29 6.29 0 0 0 2.766-5.177V8.583a8.163 8.163 0 0 0 4.694 1.48v-3.377h-1z" />
    </svg>
  );
}
