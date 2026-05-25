import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';

export interface SelectOption {
  value: number;
  label: string;
}

interface Props {
  options: SelectOption[];
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  loadingText?: string;
  disabled?: boolean;
}

/**
 * Searchable dropdown that replaces raw <select> with a filterable list.
 * Shows a search box when opened; filters by label substring.
 */
export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = 'Select…',
  loadingText = 'Loading…',
  disabled = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = query.trim()
    ? options.filter(o => o.label.toLowerCase().includes(query.toLowerCase()))
    : options;

  const selected = options.find(o => o.value === value);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Auto-focus search input when dropdown opens
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 0);
  }, [open]);

  const handleSelect = (option: SelectOption) => {
    onChange(option.value);
    setOpen(false);
    setQuery('');
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Trigger button */}
      <button
        type="button"
        disabled={disabled || options.length === 0}
        onClick={() => setOpen(prev => !prev)}
        className="w-full flex items-center justify-between border border-gray-300 rounded-md px-3 py-2 bg-white text-sm text-left focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <span className={selected ? 'text-gray-900 truncate pr-2' : 'text-gray-400'}>
          {options.length === 0 ? loadingText : (selected?.label ?? placeholder)}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl">
          {/* Search box */}
          <div className="p-2 border-b border-gray-100">
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-md px-3 py-1.5">
              <Search className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search…"
                className="bg-transparent text-sm w-full focus:outline-none text-gray-700 placeholder-gray-400"
              />
            </div>
          </div>

          {/* Options list */}
          <ul className="max-h-52 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-2.5 text-sm text-gray-400 text-center">No results found</li>
            ) : (
              filtered.map(o => (
                <li
                  key={o.value}
                  onClick={() => handleSelect(o)}
                  className={`px-3 py-2 text-sm cursor-pointer transition-colors ${
                    o.value === value
                      ? 'bg-gray-900 text-white font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {o.label}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
