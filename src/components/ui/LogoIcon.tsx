import React from 'react';

const LogoIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Book shape */}
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20v2H6.5A2.5 2.5 0 0 1 4 19.5z" fill="currentColor" stroke="none" />
    <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v2H6.5A2.5 2.5 0 0 1 4 5.5z" fill="currentColor" stroke="none" />
    <path d="M2 6v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2z" stroke="currentColor" />

    {/* Lightbulb shape inside the book */}
    <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" stroke="currentColor" />
    <path d="M12 8v2" stroke="currentColor" />
    <path d="M12 16v-2" stroke="currentColor" />
    <path d="m15 11-1.5 1.5" stroke="currentColor" />
    <path d="m10.5 12.5-1.5 1.5" stroke="currentColor" />
    <path d="m15 13-1.5-1.5" stroke="currentColor" />
    <path d="m10.5 11.5-1.5-1.5" stroke="currentColor" />
  </svg>
);

export default LogoIcon;
