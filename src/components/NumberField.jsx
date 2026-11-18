import { NUMBER_SYSTEMS } from '../utils/numberSystems.js';
import { cx, Select } from './ui.jsx';

const SYSTEM_OPTIONS = NUMBER_SYSTEMS.map((s) => ({ id: s.id, label: `${s.label} (${s.radix})` }));

/**
 * A text input paired with its own number-system dropdown.
 * `error` replaces the `hint` line when present.
 */
export default function NumberField({ id, label, value, onChange, system, onSystemChange, error, hint, placeholder }) {
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-nl-ink">
        {label}
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          spellCheck={false}
          autoComplete="off"
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={`${id}-message`}
          className={cx(
            'h-11 min-w-0 flex-1 rounded-xl border bg-nl-card px-3.5 font-mono text-[15px] text-nl-ink transition-colors placeholder:text-slate-300',
            error ? 'border-red-300 focus:border-red-400' : 'border-nl-border hover:border-slate-300 focus:border-nl-blue',
          )}
        />
        <Select
          id={`${id}-system`}
          aria-label={`${label} number system`}
          value={system}
          onChange={onSystemChange}
          options={SYSTEM_OPTIONS}
          className="w-full shrink-0 sm:w-44"
        />
      </div>
      <p
        id={`${id}-message`}
        role={error ? 'alert' : undefined}
        className={cx('mt-1.5 min-h-[1.25rem] text-xs leading-snug', error ? 'text-red-600' : 'text-nl-muted')}
      >
        {error || hint}
      </p>
    </div>
  );
}