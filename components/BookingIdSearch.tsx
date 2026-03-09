"use client";

import { useState, useRef } from "react";
import { X } from "lucide-react";

interface BookingIdSearchProps {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
}

export default function BookingIdSearch({
  options,
  selected,
  onChange,
  placeholder = "Search booking IDs...",
}: BookingIdSearchProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = options.filter(
    (o) => o.toLowerCase().includes(query.toLowerCase()) && !selected.includes(o)
  );

  const add = (id: string) => {
    onChange([...selected, id]);
    setQuery("");
    inputRef.current?.focus();
  };

  const remove = (id: string) => {
    onChange(selected.filter((s) => s !== id));
  };

  return (
    <div className="relative">
      <div
        className="flex flex-wrap items-center gap-1 min-h-9 w-full min-w-[200px] rounded-md border border-input bg-card px-2 py-1 cursor-text"
        onClick={() => { setOpen(true); inputRef.current?.focus(); }}
      >
        {selected.map((id) => (
          <span
            key={id}
            className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs rounded px-2 py-0.5"
          >
            {id}
            <button
              onMouseDown={(e) => { e.preventDefault(); remove(id); }}
              className="hover:text-destructive leading-none"
            >
              <X size={10} />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder={selected.length === 0 ? placeholder : ""}
          className="flex-1 min-w-[100px] bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>
      {open && query.length > 0 && filtered.length > 0 && (
        <div className="absolute z-50 mt-1 w-full max-h-48 overflow-auto rounded-md border bg-card shadow-md">
          {filtered.map((id) => (
            <button
              key={id}
              onMouseDown={(e) => { e.preventDefault(); add(id); }}
              className="w-full px-3 py-2 text-sm text-left hover:bg-accent transition-colors"
            >
              {id}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
