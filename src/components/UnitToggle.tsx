import { useRef, type KeyboardEvent } from 'react';
import type { Unit } from '../types/weather';

interface UnitToggleProps {
  unit: Unit;
  onChange: (unit: Unit) => void;
}

export default function UnitToggle({ unit, onChange }: UnitToggleProps) {
  const celsiusButtonRef = useRef<HTMLButtonElement>(null);
  const fahrenheitButtonRef = useRef<HTMLButtonElement>(null);

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, currentUnit: Unit) {
    let nextUnit: Unit | undefined;

    switch (event.key) {
      case 'ArrowLeft':
        nextUnit = currentUnit === 'celsius' ? 'fahrenheit' : 'celsius';
        break;
      case 'ArrowRight':
        nextUnit = currentUnit === 'celsius' ? 'fahrenheit' : 'celsius';
        break;
      case 'Home':
        nextUnit = 'celsius';
        break;
      case 'End':
        nextUnit = 'fahrenheit';
        break;
      default:
        return;
    }

    event.preventDefault();
    if (nextUnit === 'celsius') {
      celsiusButtonRef.current?.focus();
    } else {
      fahrenheitButtonRef.current?.focus();
    }
    if (nextUnit !== unit) {
      onChange(nextUnit);
    }
  }

  return (
    <div
      role="group"
      aria-label="Unidade de temperatura"
      className="inline-flex rounded-xl border border-white/10 bg-white/5 p-1"
    >
      <button
        ref={celsiusButtonRef}
        type="button"
        aria-pressed={unit === 'celsius'}
        onClick={() => onChange('celsius')}
        onKeyDown={(event) => handleKeyDown(event, 'celsius')}
        className="min-h-11 min-w-11 rounded-lg px-3 py-2 font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-night-900 aria-pressed:bg-accent-500 aria-pressed:text-night-900"
      >
        °C
      </button>
      <button
        ref={fahrenheitButtonRef}
        type="button"
        aria-pressed={unit === 'fahrenheit'}
        onClick={() => onChange('fahrenheit')}
        onKeyDown={(event) => handleKeyDown(event, 'fahrenheit')}
        className="min-h-11 min-w-11 rounded-lg px-3 py-2 font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-night-900 aria-pressed:bg-accent-500 aria-pressed:text-night-900"
      >
        °F
      </button>
    </div>
  );
}
