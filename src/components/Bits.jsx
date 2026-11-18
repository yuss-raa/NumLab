import { cx } from './ui.jsx';

const TONES = {
  a: 'border-blue-100 bg-nl-softblue text-blue-700',
  q: 'border-violet-100 bg-nl-softpurple text-violet-700',
  bit: 'border-slate-200 bg-slate-100 text-slate-600',
  warn: 'border-amber-200 bg-amber-100 text-amber-800',
};

/** A row of single-bit cells. `warnFirst` marks an extra (overflow) sign bit. */
export function Bits({ value, tone = 'a', warnFirst = false, label }) {
  return (
    <div className="flex flex-wrap gap-1" role="img" aria-label={`${label}: ${value}`}>
      {[...value].map((bit, index) => (
        <span
          key={index}
          className={cx(
            'flex h-8 w-7 items-center justify-center rounded-md border font-mono text-sm font-semibold',
            warnFirst && index === 0 ? TONES.warn : TONES[tone],
          )}
        >
          {bit}
        </span>
      ))}
    </div>
  );
}

function Group({ caption, children }) {
  return (
    <div className="min-w-0">
      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-nl-muted">{caption}</p>
      {children}
    </div>
  );
}

/** One snapshot of the combined register: A | Q | Q-1 (Q and Q-1 optional). */
export function RegisterLine({ title, A, Q, Qm1, warnA = false }) {
  return (
    <div className="grid gap-2 rounded-xl border border-nl-border bg-nl-bg/50 p-3 sm:grid-cols-[8.5rem_1fr] sm:items-center sm:gap-4">
      <p className="text-sm font-semibold text-nl-ink">{title}</p>
      <div className="flex flex-wrap items-end gap-x-5 gap-y-2">
        <Group caption={warnA ? 'A (bits + 1)' : 'A'}>
          <Bits value={A} tone="a" warnFirst={warnA} label="A register" />
        </Group>
        {Q !== undefined && (
          <Group caption="Q">
            <Bits value={Q} tone="q" label="Q register" />
          </Group>
        )}
        {Qm1 !== undefined && (
          <Group caption={'Q−1'}>
            <Bits value={Qm1} tone="bit" label="Q minus 1 bit" />
          </Group>
        )}
      </div>
    </div>
  );
}
