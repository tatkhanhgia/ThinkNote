import React from 'react';

interface ReadingTimeProps {
  minutes: number;
  locale: string;
}

const ReadingTime: React.FC<ReadingTimeProps> = ({ minutes, locale }) => {
  const label = locale === 'vi' ? `${minutes} phút đọc` : `${minutes} min read`;

  return (
    <span className="inline-flex items-center gap-1 text-sm text-gray-500">
      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
      {label}
    </span>
  );
};

export default ReadingTime;
