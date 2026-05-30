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
        className={`
          w-full flex items-center justify-between
          border rounded-lg px-3.5 py-2.5 bg-white text-sm text-left
          shadow-sm transition-all duration-150
          focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400
          disabled:opacity-50 disabled:cursor-not-allowed
          ${open
            ? 'border-yellow-400 ring-2 ring-yellow-400/40'
            : 'border-gray-200 hover:border-gray-300'
          }
        `}
      >
        <span className={`truncate pr-2 ${selected ? 'text-gray-800' : 'text-gray-400'}`}>
          {options.length === 0 ? loadingText : (selected?.label ?? placeholder)}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180 text-yellow-500' : ''}`}
        />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute z-50 w-full mt-1.5 bg-white border border-gray-200 rounded-xl shadow-card-lg animate-fade-up overflow-hidden">
          {/* Search box */}
          <div className="p-2 border-b border-gray-100 bg-slate-50/60">
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5 shadow-sm">
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
              <li className="px-4 py-3 text-sm text-gray-400 text-center">No results found</li>
            ) : (
              filtered.map(o => (
                <li
                  key={o.value}
                  onClick={() => handleSelect(o)}
                  className={`
                    px-4 py-2.5 text-sm cursor-pointer transition-colors duration-100
                    ${o.value === value
                      ? 'bg-brand-blue text-brand-yellow font-semibold'
                      : 'text-gray-700 hover:bg-slate-50'
                    }
                  `}
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
