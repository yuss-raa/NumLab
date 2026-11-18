import { useState } from 'react';
import { History as HistoryIcon, Trash2 } from 'lucide-react';
import { Badge, Button, Card, CopyButton, PageHeader } from '../components/ui.jsx';
import { SUBSCRIPT } from '../utils/format.js';
import { formatTimestamp } from '../utils/history.js';

export default function History({ entries, onClear }) {
  // Two-step confirmation built into the page (no browser dialog).
  const [confirming, setConfirming] = useState(false);

  return (
    <div>
      <PageHeader
        eyebrow="Module 3"
        title="Calculation History"
        description="Every arithmetic and Booth calculation is saved in this browser, so the list is still here after you refresh the page."
        actions={
          entries.length > 0 &&
          (confirming ? (
            <>
              <Button
                variant="danger"
                icon={Trash2}
                onClick={() => {
                  onClear();
                  setConfirming(false);
                }}
              >
                Yes, clear all {entries.length}
              </Button>
              <Button variant="outline" onClick={() => setConfirming(false)}>
                Cancel
              </Button>
            </>
          ) : (
            <Button variant="outline" icon={Trash2} onClick={() => setConfirming(true)}>
              Clear history
            </Button>
          ))
        }
      />

      <Card className="overflow-hidden">
        {entries.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-nl-softpurple text-nl-lavender">
              <HistoryIcon className="h-6 w-6" aria-hidden="true" />
            </span>
            <p className="mt-4 text-base font-bold text-nl-ink">No calculations saved</p>
            <p className="mt-1 max-w-sm text-sm text-nl-muted">
              Results from the Multiplier and the Booth Analyser appear here with their operands, number systems and time.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[46rem] text-left text-sm">
              <thead className="bg-nl-bg/70 text-xs uppercase tracking-wider text-nl-muted">
                <tr>
                  <th className="px-5 py-3 font-semibold">Date and time</th>
                  <th className="px-3 py-3 font-semibold">Operation</th>
                  <th className="px-3 py-3 font-semibold">Operand 1</th>
                  <th className="px-3 py-3 font-semibold">Operand 2</th>
                  <th className="px-3 py-3 font-semibold">Result</th>
                  <th className="px-3 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-nl-border">
                {entries.map((entry) => (
                  <tr key={entry.id} className="transition-colors hover:bg-nl-bg/50">
                    <td className="whitespace-nowrap px-5 py-3 text-nl-muted">{formatTimestamp(entry.timestamp)}</td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2 whitespace-nowrap">
                        <span className="font-medium text-nl-ink">{entry.operation}</span>
                        <Badge tone={entry.kind === 'booth' ? 'purple' : 'blue'}>{entry.kind === 'booth' ? 'Booth' : 'Arithmetic'}</Badge>
                      </div>
                    </td>
                    <td className="px-3 py-3 font-mono text-nl-ink">
                      {entry.a.text}
                      <span className="text-nl-muted">{SUBSCRIPT[entry.a.system]}</span>
                    </td>
                    <td className="px-3 py-3 font-mono text-nl-ink">
                      {entry.b.text}
                      <span className="text-nl-muted">{SUBSCRIPT[entry.b.system]}</span>
                    </td>
                    <td className="px-3 py-3">
                      <p className="num font-mono font-bold text-blue-700">{entry.result.dec}</p>
                      <p className="num font-mono text-xs text-nl-muted">
                        {entry.result.hex}
                        {SUBSCRIPT.hex}
                      </p>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <CopyButton text={entry.result.dec} label="Copy" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
