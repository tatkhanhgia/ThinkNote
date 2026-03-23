import React from 'react';

interface AuthFormCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export default function AuthFormCard({
  title,
  description,
  children,
}: AuthFormCardProps) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
            <p className="mt-2 text-sm text-gray-500">{description}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
