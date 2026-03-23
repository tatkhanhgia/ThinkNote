'use client';

/**
 * Multi-select input with chip display for article categories and tags.
 * Supports typeahead suggestions and adding new values on Enter/comma.
 */
import { useState, useRef, KeyboardEvent } from 'react';

interface CategoryTagInputProps {
  label: string;
  placeholder?: string;
  value: string[];
  onChange: (values: string[]) => void;
  suggestions?: string[];
}

export default function CategoryTagInput({ label, placeholder = 'Add...', value, onChange, suggestions = [] }: CategoryTagInputProps) {
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = suggestions.filter(
    (s) => s.toLowerCase().includes(input.toLowerCase()) && !value.includes(s)
  );

  const add = (item: string) => {
    const trimmed = item.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setInput('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const remove = (item: string) => onChange(value.filter((v) => v !== item));

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
      e.preventDefault();
      add(input.replace(/,$/, ''));
    } else if (e.key === 'Backspace' && !input && value.length > 0) {
      remove(value[value.length - 1]);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div
        className="min-h-[42px] flex flex-wrap gap-1.5 p-2 border border-gray-300 rounded-lg bg-white focus-within:ring-2 focus-within:ring-blue-300 focus-within:border-blue-400 cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((item) => (
          <span
            key={item}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-medium"
          >
            {item}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); remove(item); }}
              className="hover:text-blue-900 leading-none"
              aria-label={`Remove ${item}`}
            >
              ×
            </button>
          </span>
        ))}
        <div className="relative flex-1 min-w-[120px]">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => { setInput(e.target.value); setShowSuggestions(true); }}
            onKeyDown={handleKey}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            placeholder={value.length === 0 ? placeholder : ''}
            className="w-full text-sm outline-none bg-transparent py-0.5"
          />
          {showSuggestions && filtered.length > 0 && (
            <ul className="absolute left-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto">
              {filtered.slice(0, 8).map((s) => (
                <li key={s}>
                  <button
                    type="button"
                    onMouseDown={() => add(s)}
                    className="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                  >
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <p className="mt-1 text-xs text-gray-400">Press Enter or comma to add</p>
    </div>
  );
}
