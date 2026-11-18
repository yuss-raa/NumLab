import { cx, CopyButton } from './ui.jsx';

/**
 * Grid of result tiles (Binary / Octal / Decimal / Hexadecimal).
 * items: [{ id, label, value, display?, note? }]  - `value` is what gets copied.
 */
export default function ResultGrid({ items, highlightId }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map((item) => {
        const active = item.id === highlightId;
        return (
          <div
            key={item.id}
            className={cx(
              'min-w-0 rounded-xl border p-4 transition-colors',
              active ? 'border-blue-200 bg-nl-softblue/60' : 'border-nl-border bg-nl-bg/60',
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-nl-muted">{item.label}</span>
              <CopyButton text={item.value} compact />
            </div>
            <p className="num mt-2 break-all font-mono text-lg font-semibold text-nl-ink">{item.display ?? item.value}</p>
            {item.note && <p className="mt-1 text-xs text-nl-muted">{item.note}</p>}
          </div>
        );
      })}
    </div>
  );
}
