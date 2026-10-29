import { type FormEvent, useId, useRef, useState } from 'react';

interface SearchBarProps {
  onSearch: (city: string) => void;
  disabled?: boolean;
}

export default function SearchBar({ onSearch, disabled = false }: SearchBarProps) {
  const [city, setCity] = useState('');
  const [error, setError] = useState('');
  const inputId = useId();
  const errorId = `${inputId}-error`;
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (disabled) return;

    const trimmedCity = city.trim();
    if (!trimmedCity) {
      setError('Digite uma cidade para buscar.');
      inputRef.current?.focus();
      return;
    }

    setError('');
    onSearch(trimmedCity);
  }

  return (
    <form
      role="search"
      aria-label="Buscar cidade"
      onSubmit={handleSubmit}
      className="rounded-2xl border border-white/10 bg-white/5 p-4 font-sans text-white shadow-glass backdrop-blur-md"
    >
      <label htmlFor={inputId} className="mb-2 block text-sm font-medium">
        Cidade
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          ref={inputRef}
          id={inputId}
          name="city"
          type="search"
          value={city}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          onChange={(event) => {
            setCity(event.target.value);
            setError('');
          }}
          placeholder="Ex.: Salvador"
          className="min-h-11 min-w-0 flex-1 rounded-xl border border-white/10 bg-night-900 px-4 py-2 text-white placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 disabled:cursor-not-allowed disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={disabled}
          className="min-h-11 min-w-11 rounded-xl bg-accent-500 px-5 py-2 font-semibold text-night-900 enabled:hover:bg-accent-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-night-900 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Buscar
        </button>
      </div>
      {error && (
        <p id={errorId} role="alert" className="mt-2 text-sm text-white">
          {error}
        </p>
      )}
    </form>
  );
}
