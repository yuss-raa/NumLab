import { useEffect, useRef, useState } from 'react';
import { Calculator, RotateCcw } from 'lucide-react';
import NumberField from '../components/NumberField.jsx';
import ResultGrid from '../components/ResultGrid.jsx';
import { Badge, Button, Card, CopyButton, PageHeader, Select, SectionTitle } from '../components/ui.jsx';
import { ARITHMETIC_EXAMPLES } from '../data/examples.js';
import { OPERATIONS, evaluate, getOperation } from '../utils/arithmetic.js';
import { NUMBER_SYSTEMS, bigintToString, convertAll, getSystem, validateNumber } from '../utils/numberSystems.js';
import { createEntry } from '../utils/history.js';
import { withBase } from '../utils/format.js';

const OUTPUT_OPTIONS = NUMBER_SYSTEMS.map((s) => ({ id: s.id, label: `${s.label} (${s.radix})` }));
const DEFAULTS = { aText: 'A3', aSys: 'hex', bText: '1011', bSys: 'bin', op: 'add' };

/** Live hint under an operand: its decimal equivalent, or a syntax error. */
function describeOperand(text, systemId, submitted) {
  const radix = getSystem(systemId).radix;
  if (text.trim() === '') return { error: submitted ? 'Enter a value.' : null, hint: 'Decimal equivalent appears here.' };
  const parsed = validateNumber(text, radix);
  if (!parsed.valid) return { error: parsed.error, hint: '' };
  return { error: null, hint: `Decimal equivalent: ${parsed.value}` };
}

export default function Multiplier({ preset, onSave }) {
  const [fields, setFields] = useState(DEFAULTS);
  const [outSys, setOutSys] = useState('dec');
  const [submitted, setSubmitted] = useState(false);
  const [output, setOutput] = useState(null);

  const set = (key) => (value) => setFields((prev) => ({ ...prev, [key]: value }));

  function calculate(values, { save = true } = {}) {
    setSubmitted(true);
    const outcome = evaluate({
      aText: values.aText,
      aRadix: getSystem(values.aSys).radix,
      bText: values.bText,
      bRadix: getSystem(values.bSys).radix,
      operation: values.op,
    });
    if (!outcome.ok) {
      setOutput(null);
      return;
    }
    const operation = getOperation(values.op);
    setOutput({ ...outcome, values, operation });
    if (save) {
      onSave(
        createEntry({
          kind: 'arithmetic',
          operation: operation.label,
          symbol: operation.symbol,
          a: { text: values.aText.trim(), system: values.aSys },
          b: { text: values.bText.trim(), system: values.bSys },
          result: convertAll(outcome.result),
        }),
      );
    }
  }

  // Open with a realistic working state (not saved to history).
  useEffect(() => {
    if (!preset) calculate(DEFAULTS, { save: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Apply a sample chosen on the Dashboard, once per selection
  // (the ref also stops React StrictMode from applying it twice in development).
  const appliedPreset = useRef(null);
  useEffect(() => {
    if (!preset || appliedPreset.current === preset.nonce) return;
    appliedPreset.current = preset.nonce;
    const next = { aText: preset.aText, aSys: preset.aSys, bText: preset.bText, bSys: preset.bSys, op: preset.op };
    setFields(next);
    calculate(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preset?.nonce]);

  function reset() {
    setFields({ aText: '', aSys: 'dec', bText: '', bSys: 'dec', op: 'add' });
    setOutSys('dec');
    setSubmitted(false);
    setOutput(null);
  }

  const a = describeOperand(fields.aText, fields.aSys, submitted);
  const b = describeOperand(fields.bText, fields.bSys, submitted);
  const all = output ? convertAll(output.result) : null;
  const items = all
    ? NUMBER_SYSTEMS.map((s) => ({ id: s.id, label: s.label, value: all[s.id], note: `Base ${s.radix}` }))
    : [];
  const preferred = output ? bigintToString(output.result, getSystem(outSys).radix) : '';

  return (
    <div>
      <PageHeader
        eyebrow="Module 1"
        title="Multiplier & Arithmetic Operations"
        description="Add, subtract or multiply two numbers written in different number systems. Each operand is parsed in its own base, so A3 in hexadecimal and 1011 in binary work together."
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Card className="p-5 sm:p-6">
          <SectionTitle icon={Calculator}>Inputs</SectionTitle>
          <form
            className="flex flex-col gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              calculate(fields);
            }}
          >
            <NumberField
              id="op-a"
              label="First operand"
              value={fields.aText}
              onChange={set('aText')}
              system={fields.aSys}
              onSystemChange={set('aSys')}
              error={a.error}
              hint={a.hint}
              placeholder="e.g. A3"
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="op-operation" className="mb-1.5 block text-sm font-semibold text-nl-ink">
                  Operation
                </label>
                <Select id="op-operation" value={fields.op} onChange={set('op')} options={OPERATIONS} />
              </div>
              <div>
                <label htmlFor="op-output" className="mb-1.5 block text-sm font-semibold text-nl-ink">
                  Preferred output
                </label>
                <Select id="op-output" value={outSys} onChange={setOutSys} options={OUTPUT_OPTIONS} />
              </div>
            </div>
            <NumberField
              id="op-b"
              label="Second operand"
              value={fields.bText}
              onChange={set('bText')}
              system={fields.bSys}
              onSystemChange={set('bSys')}
              error={b.error}
              hint={b.hint}
              placeholder="e.g. 1011"
            />
            <div className="flex flex-wrap gap-2 pt-1">
              <Button type="submit" icon={Calculator}>
                Calculate
              </Button>
              <Button variant="outline" icon={RotateCcw} onClick={reset}>
                Clear
              </Button>
            </div>
          </form>

          <div className="mt-6 border-t border-nl-border pt-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-nl-muted">Sample calculations</p>
            <div className="flex flex-wrap gap-2">
              {ARITHMETIC_EXAMPLES.map((example) => (
                <button
                  key={example.id}
                  type="button"
                  onClick={() => {
                    const next = {
                      aText: example.aText,
                      aSys: example.aSys,
                      bText: example.bText,
                      bSys: example.bSys,
                      op: example.op,
                    };
                    setFields(next);
                    calculate(next);
                  }}
                  className="rounded-lg border border-nl-border bg-nl-bg px-3 py-1.5 font-mono text-xs font-medium text-nl-ink transition-colors hover:border-blue-200 hover:bg-nl-softblue"
                >
                  {example.label}
                </button>
              ))}
            </div>
          </div>
        </Card>

        <Card className="p-5 sm:p-6" aria-live="polite">
          <SectionTitle icon={Calculator} action={output && <Badge tone="green">Calculated</Badge>}>
            Result
          </SectionTitle>

          {!output ? (
            <div className="flex min-h-[16rem] flex-col items-center justify-center rounded-xl border border-dashed border-nl-border bg-nl-bg/50 p-6 text-center">
              <p className="text-sm font-semibold text-nl-ink">No result yet</p>
              <p className="mt-1 max-w-xs text-sm text-nl-muted">
                Enter two valid operands and choose Calculate, or pick a sample calculation.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              <div className="rounded-xl bg-nl-softblue/50 p-4">
                <p className="break-words font-mono text-sm text-nl-muted">
                  {withBase(output.values.aText.trim(), output.values.aSys)} {output.operation.symbol}{' '}
                  {withBase(output.values.bText.trim(), output.values.bSys)}
                </p>
                <div className="mt-2 flex items-start justify-between gap-3">
                  <p className="num min-w-0 break-all font-mono text-2xl font-bold text-nl-ink sm:text-3xl">
                    {preferred}
                  </p>
                  <CopyButton text={preferred} label="Copy result" className="shrink-0" />
                </div>
                <p className="mt-1 text-xs font-medium text-blue-700">
                  {getSystem(outSys).label} (base {getSystem(outSys).radix})
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-nl-border p-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-nl-muted">First operand</p>
                  <p className="num mt-1 break-all font-mono text-sm font-semibold">{output.a.toString()}</p>
                  <p className="text-xs text-nl-muted">decimal</p>
                </div>
                <div className="rounded-xl border border-nl-border p-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-nl-muted">Second operand</p>
                  <p className="num mt-1 break-all font-mono text-sm font-semibold">{output.b.toString()}</p>
                  <p className="text-xs text-nl-muted">decimal</p>
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-nl-muted">
                  Result in every system
                </p>
                <ResultGrid items={items} highlightId={outSys} />
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
