'use client';

import React from 'react';
import { BLOG_MOODS, type BlogMood } from '@/lib/blog-moods';

interface MoodFilterProps {
  moods: { mood: string; count: number }[];
  activeMood: string | null;
  onMoodChange: (mood: string | null) => void;
  locale: string;
}

const MoodFilter: React.FC<MoodFilterProps> = ({ moods, activeMood, onMoodChange, locale }) => {
  const allLabel = locale === 'vi' ? 'Tất cả' : 'All';

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label={locale === 'vi' ? 'Lọc theo tâm trạng' : 'Filter by mood'}>
      {/* All chip */}
      <button
        onClick={() => onMoodChange(null)}
        className={`mood-chip transition-all ${
          activeMood === null
            ? 'bg-gray-800 text-white'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
        aria-pressed={activeMood === null}
      >
        {allLabel}
      </button>

      {moods.map(({ mood, count }) => {
        const key = mood as BlogMood;
        const data = BLOG_MOODS[key] ?? { icon: '📝', en: mood, vi: mood };
        const label = locale === 'vi' ? data.vi : data.en;
        const isActive = activeMood === mood;

        return (
          <button
            key={mood}
            onClick={() => onMoodChange(isActive ? null : mood)}
            className={`mood-chip mood-chip--${key} transition-all ${
              isActive ? 'ring-2 ring-offset-1 ring-current opacity-100' : 'opacity-80 hover:opacity-100'
            }`}
            aria-pressed={isActive}
          >
            {data.icon} {label}
            <span className="ml-1 text-xs opacity-70">({count})</span>
          </button>
        );
      })}
    </div>
  );
};

export default MoodFilter;
