/**
 * ui.jsx - small reusable building blocks (cards, buttons, selects, copy button).
 */
import { useState } from 'react';
import { Check, ChevronDown, Copy } from 'lucide-react';

/** Join class names, skipping falsy values. */
export const cx = (...parts) => parts.filter(Boolean).join(' ');

export function Card({ as: Tag = 'section', className, children, ...rest }) {
  return (
    <Tag className={cx('rounded-2xl border border-nl-border bg-nl-card shadow-card', className)} {...rest}>
      {children}
    </Tag>
  );
}

const BUTTON_STYLES = {
  primary: 'bg-nl-blue text-white shadow-sm hover:bg-blue-600',
  soft: 'bg-nl-softblue text-blue-700 hover:bg-blue-200/70',
  purple: 'bg-nl-softpurple text-violet-700 hover:bg-violet-200/70',
  outline: 'border border-nl-border bg-white text-nl-ink hover:bg-nl-bg',
  ghost: 'text-nl-muted hover:bg-nl-bg hover:text-nl-ink',
  danger: 'border border-red-200 bg-white text-red-600 hover:bg-red-50',
};

export function Button({ variant = 'primary', icon: Icon, children, className, ...rest }) {
  return (
    <button
      type="button"
      className={cx(
        'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50',
        BUTTON_STYLES[variant],
        className,
      )}
      {...rest}
    >
      {Icon && <Icon className="h-4 w-4" aria-hidden="true" />}
      {children}
    </button>
  );
}

/** Square icon-only button; `label` is the accessible name. */
export function IconButton({ icon: Icon, label, variant = 'outline', className, ...rest }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cx(
        'inline-flex h-10 w-10 items-center justify-center rounded-xl transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-40',
        BUTTON_STYLES[variant],
        className,
      )}
      {...rest}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
    </button>
  );
}

export function Select({ id, value, onChange, options, className, ...rest }) {
  return (
    <div className={cx('relative', className)}>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full appearance-none rounded-xl border border-nl-border bg-white pl-3 pr-9 text-sm font-medium text-nl-ink transition-colors hover:border-slate-300 focus:border-nl-blue"
        {...rest}
      >
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-nl-muted"
        aria-hidden="true"
      />
    </div>
  );
}

/**
 * Legacy copy fallback for browsers or embedded views that refuse the async
 * Clipboard API. It is only used when navigator.clipboard fails.
 */
function legacyCopy(text) {
  try {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(area);
    return ok;
  } catch {
    return false;
  }
}

export function CopyButton({ text, label = 'Copy', compact = false, className }) {
  const [state, setState] = useState('idle'); // idle | done | failed

  async function copy() {
    let ok = false;
    try {
      await navigator.clipboard.writeText(text);
      ok = true;
    } catch {
      ok = legacyCopy(text);
    }
    setState(ok ? 'done' : 'failed');
    setTimeout(() => setState('idle'), 1600);
  }

  const Icon = state === 'done' ? Check : Copy;
  const caption = state === 'done' ? 'Copied' : state === 'failed' ? 'Copy failed' : label;

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={`${label} ${text}`}
      className={cx(
        'inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold transition-colors',
        state === 'done' ? 'bg-emerald-50 text-emerald-700' : 'text-nl-muted hover:bg-white hover:text-nl-blue',
        className,
      )}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {!compact || state !== 'idle' ? caption : null}
    </button>
  );
}

export function Badge({ tone = 'blue', children, className }) {
  const tones = {
    blue: 'bg-nl-softblue text-blue-700',
    purple: 'bg-nl-softpurple text-violet-700',
    green: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    slate: 'bg-slate-100 text-slate-600',
  };
  return (
    <span
      className={cx(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-nl-lavender">{eyebrow}</p>
        )}
        <h1 className="text-2xl font-bold tracking-tight text-nl-ink sm:text-3xl [text-wrap:balance]">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-nl-muted">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </header>
  );
}

export function SectionTitle({ icon: Icon, children, action }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="flex items-center gap-2 text-base font-bold text-nl-ink">
        {Icon && (
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-nl-softblue text-nl-blue">
            <Icon className="h-4 w-4" aria-hidden="true" />
          </span>
        )}
        {children}
      </h2>
      {action}
    </div>
  );
}
