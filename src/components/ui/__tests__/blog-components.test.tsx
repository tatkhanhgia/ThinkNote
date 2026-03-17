import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ReadingTime from '../ReadingTime';
import BlogCard from '../BlogCard';
import MoodFilter from '../MoodFilter';

// ── ReadingTime ──────────────────────────────────────────────
describe('ReadingTime', () => {
  it('renders EN label', () => {
    render(<ReadingTime minutes={5} locale="en" />);
    expect(screen.getByText('5 min read')).toBeTruthy();
  });

  it('renders VI label', () => {
    render(<ReadingTime minutes={3} locale="vi" />);
    expect(screen.getByText('3 phút đọc')).toBeTruthy();
  });

  it('uses singular for 1 minute', () => {
    render(<ReadingTime minutes={1} locale="en" />);
    expect(screen.getByText('1 min read')).toBeTruthy();
  });
});

// ── BlogCard ─────────────────────────────────────────────────
describe('BlogCard', () => {
  const baseProps = {
    title: 'Test Post',
    description: 'Test description',
    date: '2026-03-18',
    mood: 'inspired',
    readingTime: 4,
    tags: ['life', 'code'],
    href: '/en/blog/test-post',
    locale: 'en',
  };

  it('renders title', () => {
    render(<BlogCard {...baseProps} />);
    expect(screen.getByText('Test Post')).toBeTruthy();
  });

  it('renders description', () => {
    render(<BlogCard {...baseProps} />);
    expect(screen.getByText('Test description')).toBeTruthy();
  });

  it('renders reading time', () => {
    render(<BlogCard {...baseProps} />);
    expect(screen.getByText('4 min read')).toBeTruthy();
  });

  it('renders mood chip with icon', () => {
    render(<BlogCard {...baseProps} />);
    expect(screen.getByText(/Inspired/)).toBeTruthy();
  });

  it('renders up to 3 tags', () => {
    render(<BlogCard {...baseProps} tags={['a', 'b', 'c', 'd']} />);
    expect(screen.getByText('a')).toBeTruthy();
    expect(screen.getByText('c')).toBeTruthy();
    expect(screen.queryByText('d')).toBeNull();
  });

  it('renders VI mood label when locale is vi', () => {
    render(<BlogCard {...baseProps} mood="joyful" locale="vi" />);
    expect(screen.getByText(/Vui vẻ/)).toBeTruthy();
  });

  it('links to correct href', () => {
    render(<BlogCard {...baseProps} />);
    const link = screen.getByRole('link');
    expect(link.getAttribute('href')).toBe('/en/blog/test-post');
  });

  it('handles unknown mood gracefully', () => {
    render(<BlogCard {...baseProps} mood="unknown-mood" />);
    expect(screen.getByText('Test Post')).toBeTruthy();
  });
});

// ── MoodFilter ───────────────────────────────────────────────
describe('MoodFilter', () => {
  const moods = [
    { mood: 'joyful', count: 3 },
    { mood: 'inspired', count: 1 },
  ];

  it('renders All chip', () => {
    render(<MoodFilter moods={moods} activeMood={null} onMoodChange={vi.fn()} locale="en" />);
    expect(screen.getByText('All')).toBeTruthy();
  });

  it('renders VI All label', () => {
    render(<MoodFilter moods={moods} activeMood={null} onMoodChange={vi.fn()} locale="vi" />);
    expect(screen.getByText('Tất cả')).toBeTruthy();
  });

  it('renders mood chips with counts', () => {
    render(<MoodFilter moods={moods} activeMood={null} onMoodChange={vi.fn()} locale="en" />);
    expect(screen.getByText(/\(3\)/)).toBeTruthy();
    expect(screen.getByText(/\(1\)/)).toBeTruthy();
  });

  it('calls onMoodChange with mood key when mood chip clicked', () => {
    const onChange = vi.fn();
    render(<MoodFilter moods={moods} activeMood={null} onMoodChange={onChange} locale="en" />);
    fireEvent.click(screen.getByText(/Joyful/));
    expect(onChange).toHaveBeenCalledWith('joyful');
  });

  it('calls onMoodChange(null) when All clicked', () => {
    const onChange = vi.fn();
    render(<MoodFilter moods={moods} activeMood="joyful" onMoodChange={onChange} locale="en" />);
    fireEvent.click(screen.getByText('All'));
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('toggles off active mood when clicked again', () => {
    const onChange = vi.fn();
    render(<MoodFilter moods={moods} activeMood="joyful" onMoodChange={onChange} locale="en" />);
    fireEvent.click(screen.getByText(/Joyful/));
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('renders empty without mood chips when moods array is empty', () => {
    render(<MoodFilter moods={[]} activeMood={null} onMoodChange={vi.fn()} locale="en" />);
    expect(screen.getByText('All')).toBeTruthy();
    expect(screen.queryByText(/\(\d+\)/)).toBeNull();
  });
});
