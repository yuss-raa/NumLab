import { useEffect, useRef, useState } from 'react';
import { Cpu, FastForward, Pause, Play, RotateCcw, SkipBack, SkipForward } from 'lucide-react';
import NumberField from '../components/NumberField.jsx';
import ResultGrid from '../components/ResultGrid.jsx';
import { RegisterLine } from '../components/Bits.jsx';
import { Badge, Button, Card, cx, IconButton, PageHeader, Select, SectionTitle } from '../components/ui.jsx';
import { BOOTH_EXAMPLES } from '../data/examples.js';
import { MAX_BITS, MIN_BITS, runBooth, validateBoothInputs } from '../utils/booth.js';
import {
  binaryToHex,
  binaryToOctal,
  getSystem,
  groupBits,
  toTwosComplement,
  validateNumber,
} from '../utils/numberSystems.js';
import { createEntry } from '../utils/history.js';

/** The four Booth rules. */
const RULES = [
  { pair: '00', action: 'Arithmetic right shift', note: 'Middle of a run of 0s' },
  { pair: '01', action: 'A = A + M, then shift', note: 'End of a run of 1s' },
  { pair: '10', action: 'A = A − M, then shift', note: 'Start of a run of 1s' },
  { pair: '11', action: 'Arithmetic right shift', note: 'Middle of a run of 1s' },
];

const SPEEDS = [
  { id: '1800', label: 'Slow' },
  { id: '1000', label: 'Normal' },
  { id: '450', label: 'Fast' },
];

const DEFAULTS = { mText: '7', mSys: 'dec', qText: '3', qSys: 'dec', bitsText: '4' };

/** Live hint under an operand, based on the chosen bit width. */
function describe(text, systemId, bits, submitted) {
  const parsed = text.trim() === '' ? null : validateNumber(text, getSystem(systemId).radix);
  if (!parsed) return { error: submitted ? 'Enter a value.' : null, hint: 'Decimal and two’s complement appear here.' };
  if (!parsed.valid) return { error: parsed.error, hint: '' };
  let pattern = '';
  if (Number.isInteger(bits) && bits >= MIN_BITS && bits <= MAX_BITS) {
    try {
      pattern = ` · ${bits}-bit: ${toTwosComplement(parsed.value, bits)}`;
    } catch {
      pattern = '';
    }
  }
  return { error: null, hint: `Decimal ${parsed.value}${pattern}` };
}

export default function BoothAnalyser({ preset, onSave }) {
  const [fields, setFields] = useState(DEFAULTS);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  // Open with a worked example so the page is never empty.
  const [run, setRun] = useState(() => runBooth(7n, 3n, 4));
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState('1000');

  const set = (key) => (value) => {
    setFields((prev) => ({ ...prev, [key]: value }));
    setErrors({}); // earlier range errors no longer apply once the input changes
  };
  const last = run.steps.length - 1;
  const finished = idx === last;
  const step = run.steps[idx];

  function execute(values) {
    setSubmitted(true);
    const bits = Number(values.bitsText);
    const m = validateNumber(values.mText, getSystem(values.mSys).radix);
    const q = validateNumber(values.qText, getSystem(values.qSys).radix);
    const next = {};
    if (!m.valid) next.m = m.error;
    if (!q.valid) next.q = q.error;
    if (!Number.isInteger(bits)) next.bits = `Bit width must be a whole number from ${MIN_BITS} to ${MAX_BITS}.`;
    if (m.valid && q.valid && Number.isInteger(bits)) {
      Object.assign(next, validateBoothInputs(m.value, q.value, bits).errors);
    }
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const result = runBooth(m.value, q.value, bits);
    setRun(result);
    setIdx(0);
    setPlaying(false);
    const pattern = result.productBits;
    onSave(
      createEntry({
        kind: 'booth',
        operation: `Booth (${bits}-bit)`,
        symbol: '×',
        a: { text: values.mText.trim(), system: values.mSys },
        b: { text: values.qText.trim(), system: values.qSys },
        result: {
          dec: result.product.toString(),
          bin: pattern,
          oct: binaryToOctal(pattern),
          hex: binaryToHex(pattern),
        },
      }),
    );
  }

  // Apply an example chosen on the Dashboard, once per selection
  // (the ref also stops React StrictMode from applying it twice in development).
  const appliedPreset = useRef(null);
  useEffect(() => {
    if (!preset || appliedPreset.current === preset.nonce) return;
    appliedPreset.current = preset.nonce;
    const next = {
      mText: preset.mText,
      mSys: preset.mSys,
      qText: preset.qText,
      qSys: preset.qSys,
      bitsText: String(preset.bits),
    };
    setFields(next);
    execute(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preset?.nonce]);

  // Auto-play: advance one iteration per tick, stop at the end.
  useEffect(() => {
    if (!playing) return undefined;
    if (idx >= last) {
      setPlaying(false);
      return undefined;
    }
    const timer = setTimeout(() => setIdx((i) => i + 1), Number(speed));
    return () => clearTimeout(timer);
  }, [playing, idx, last, speed]);

  function togglePlay() {
    if (playing) {
      setPlaying(false);
      return;
    }
    if (finished) setIdx(0);
    setPlaying(true);
  }

  const bitsNumber = Number(fields.bitsText);
  const m = describe(fields.mText, fields.mSys, bitsNumber, submitted);
  const q = describe(fields.qText, fields.qSys, bitsNumber, submitted);
  const mError = errors.m || m.error;
  const qError = errors.q || q.error;

  const pattern = run.productBits;
  const resultItems = [
    { id: 'bin', label: `Binary (${pattern.length}-bit two’s complement)`, value: pattern, display: groupBits(pattern) },
    { id: 'dec', label: 'Decimal (signed)', value: run.product.toString() },
    { id: 'oct', label: 'Octal (of the bit pattern)', value: binaryToOctal(pattern) },
    { id: 'hex', label: 'Hexadecimal (of the bit pattern)', value: binaryToHex(pattern) },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Module 2"
        title="Booth Algorithm Analyser"
        description="Watch Booth's algorithm multiply two signed two's complement numbers one iteration at a time. Every register value comes from the real add, subtract and shift steps."
      />

      {/* ---------- Inputs ---------- */}
      <Card className="p-5 sm:p-6">
        <SectionTitle icon={Cpu}>Inputs</SectionTitle>
        <form
          className="grid gap-4 lg:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            execute(fields);
          }}
        >
          <NumberField
            id="booth-m"
            label="Multiplicand (M)"
            value={fields.mText}
            onChange={set('mText')}
            system={fields.mSys}
            onSystemChange={set('mSys')}
            error={mError}
            hint={m.hint}
            placeholder="e.g. 7"
          />
          <NumberField
            id="booth-q"
            label="Multiplier (Q)"
            value={fields.qText}
            onChange={set('qText')}
            system={fields.qSys}
            onSystemChange={set('qSys')}
            error={qError}
            hint={q.hint}
            placeholder="e.g. 3"
          />
          <div className="lg:col-span-2">
            <label htmlFor="booth-bits" className="mb-1.5 block text-sm font-semibold text-nl-ink">
              Bit width (n)
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <input
                id="booth-bits"
                type="number"
                min={MIN_BITS}
                max={MAX_BITS}
                value={fields.bitsText}
                onChange={(event) => set('bitsText')(event.target.value)}
                aria-invalid={errors.bits ? 'true' : 'false'}
                className={cx(
                  'h-11 w-24 rounded-xl border bg-white px-3.5 font-mono text-[15px] transition-colors',
                  errors.bits ? 'border-red-300' : 'border-nl-border hover:border-slate-300 focus:border-nl-blue',
                )}
              />
              {[4, 8, 16, 32].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => set('bitsText')(String(n))}
                  className={cx(
                    'h-11 rounded-xl border px-3.5 text-sm font-semibold transition-colors',
                    bitsNumber === n
                      ? 'border-blue-200 bg-nl-softblue text-blue-700'
                      : 'border-nl-border bg-white text-nl-muted hover:text-nl-ink',
                  )}
                >
                  {n}-bit
                </button>
              ))}
            </div>
            <p className={cx('mt-1.5 text-xs', errors.bits ? 'text-red-600' : 'text-nl-muted')} role={errors.bits ? 'alert' : undefined}>
              {errors.bits || `Allowed range ${MIN_BITS} to ${MAX_BITS}. Both operands must fit in n bits as signed values.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 lg:col-span-2">
            <Button type="submit" icon={Cpu}>
              Run Booth's algorithm
            </Button>
          </div>
        </form>

        <div className="mt-5 border-t border-nl-border pt-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-nl-muted">Examples</p>
          <div className="flex flex-wrap gap-2">
            {BOOTH_EXAMPLES.map((example) => (
              <button
                key={example.id}
                type="button"
                onClick={() => {
                  const next = {
                    mText: example.mText,
                    mSys: example.mSys,
                    qText: example.qText,
                    qSys: example.qSys,
                    bitsText: String(example.bits),
                  };
                  setFields(next);
                  execute(next);
                }}
                className="rounded-lg border border-nl-border bg-nl-bg px-3 py-1.5 font-mono text-xs font-medium text-nl-ink transition-colors hover:border-blue-200 hover:bg-nl-softblue"
              >
                {example.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* ---------- Setup summary + rules ---------- */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Card className="p-5 sm:p-6">
          <SectionTitle>Registers at the start</SectionTitle>
          <dl className="grid gap-3 text-sm">
            {[
              ['M (multiplicand)', run.M, run.multiplicand.toString()],
              ['Q (multiplier)', run.initialQ, run.multiplier.toString()],
            ].map(([name, bits, dec]) => (
              <div key={name} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 rounded-xl bg-nl-bg/70 px-4 py-3">
                <dt className="font-semibold text-nl-ink">{name}</dt>
                <dd className="num min-w-0 break-all font-mono text-nl-ink">
                  {bits} <span className="text-nl-muted">= {dec}</span>
                </dd>
              </div>
            ))}
            <div className="rounded-xl bg-nl-bg/70 px-4 py-3 text-nl-muted">
              A starts at 0, Q&minus;1 starts at 0, and there are <strong className="text-nl-ink">{run.bits}</strong>{' '}
              iterations.
            </div>
          </dl>
        </Card>

        <Card className="p-5 sm:p-6">
          <SectionTitle>Booth's rules</SectionTitle>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-nl-muted">
                  <th className="pb-2 pr-3 font-semibold">Q0 Q&minus;1</th>
                  <th className="pb-2 pr-3 font-semibold">Operation</th>
                  <th className="pb-2 font-semibold">Meaning</th>
                </tr>
              </thead>
              <tbody>
                {RULES.map((rule) => {
                  const active = idx > 0 && step.pair === rule.pair;
                  return (
                    <tr key={rule.pair} className={cx('transition-colors', active && 'bg-nl-softblue/70')}>
                      <td className="rounded-l-lg py-2 pl-2 pr-3 font-mono font-semibold text-blue-700">{rule.pair}</td>
                      <td className="py-2 pr-3 font-medium text-nl-ink">{rule.action}</td>
                      <td className="rounded-r-lg py-2 pr-2 text-nl-muted">{rule.note}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* ---------- Step-by-step player ---------- */}
      <Card className="p-5 sm:p-6" aria-live="polite">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-nl-muted">Execution</p>
            <p className="text-xl font-bold text-nl-ink">{idx === 0 ? 'Initial state' : `Iteration ${idx} of ${run.bits}`}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <IconButton icon={RotateCcw} label="Reset" onClick={() => { setPlaying(false); setIdx(0); }} disabled={idx === 0 && !playing} />
            <IconButton icon={SkipBack} label="Previous step" onClick={() => { setPlaying(false); setIdx((i) => Math.max(0, i - 1)); }} disabled={idx === 0} />
            <button
              type="button"
              onClick={togglePlay}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-nl-blue px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-600"
            >
              {playing ? <Pause className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}
              {playing ? 'Pause' : finished ? 'Replay' : 'Play'}
            </button>
            <IconButton icon={SkipForward} label="Next step" onClick={() => { setPlaying(false); setIdx((i) => Math.min(last, i + 1)); }} disabled={finished} />
            <IconButton icon={FastForward} label="Jump to the end" onClick={() => { setPlaying(false); setIdx(last); }} disabled={finished} />
            <Select id="booth-speed" aria-label="Playback speed" value={speed} onChange={setSpeed} options={SPEEDS} className="w-28" />
          </div>
        </div>

        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-nl-softblue" role="progressbar" aria-valuemin={0} aria-valuemax={last} aria-valuenow={idx} aria-label="Algorithm progress">
          <div className="h-full rounded-full bg-nl-blue transition-all duration-300" style={{ width: `${(idx / last) * 100}%` }} />
        </div>

        <div className="mt-5 flex flex-col gap-3">
          {idx === 0 ? (
            <RegisterLine title="Start" A={step.A} Q={step.Q} Qm1={step.Qm1} />
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="slate">Q0 = {step.q0}</Badge>
                <Badge tone="slate">Q&minus;1 = {step.qm1}</Badge>
                <Badge tone="blue">Rule {step.pair}</Badge>
                <Badge tone={step.op === 'shift' ? 'slate' : 'purple'}>{step.opLabel}</Badge>
                {step.overflow && <Badge tone="amber">Extra sign bit kept</Badge>}
              </div>
              <RegisterLine title="Before" A={step.before.A} Q={step.before.Q} Qm1={step.before.Qm1} />
              {step.op !== 'shift' && (
                <RegisterLine
                  title={step.op === 'add' ? 'After A + M' : 'After A − M'}
                  A={step.afterOp}
                  warnA={step.overflow}
                />
              )}
              <RegisterLine title="After shift" A={step.A} Q={step.Q} Qm1={step.Qm1} />
            </>
          )}
          <p className="rounded-xl bg-nl-softpurple/60 px-4 py-3 text-sm leading-relaxed text-nl-ink">{step.explanation}</p>
        </div>
      </Card>

      {/* ---------- Full iteration table ---------- */}
      <Card className="p-5 sm:p-6">
        <SectionTitle>All iterations</SectionTitle>
        <div className="overflow-x-auto">
          <table className="num w-full min-w-[56rem] border-separate border-spacing-0 text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wider text-nl-muted">
                <th rowSpan={2} className="border-b border-nl-border px-3 pb-2 text-left font-semibold">Step</th>
                <th colSpan={3} className="border-b border-nl-border px-3 pb-1 text-center font-semibold">Before</th>
                <th colSpan={2} className="border-b border-nl-border px-3 pb-1 text-center font-semibold">Rule</th>
                <th className="border-b border-nl-border px-3 pb-1 text-center font-semibold">Add / subtract</th>
                <th colSpan={3} className="border-b border-nl-border px-3 pb-1 text-center font-semibold">After arithmetic right shift</th>
              </tr>
              <tr className="text-xs text-nl-muted">
                {['A', 'Q', 'Q−1', 'Q0 Q−1', 'Operation', 'A', 'A', 'Q', 'Q−1'].map((h, i) => (
                  <th key={i} className="border-b border-nl-border px-3 pb-2 text-left font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="font-mono">
              {run.steps.map((s, i) => {
                const current = i === idx;
                const visible = i <= idx;
                const cell = 'border-b border-nl-border/70 px-3 py-2.5';
                const dim = visible ? '' : 'text-slate-300';
                return (
                  <tr key={s.step} className={cx('transition-colors', current ? 'bg-nl-softblue/70' : i % 2 ? 'bg-nl-bg/40' : '')} aria-current={current ? 'step' : undefined}>
                    <td className={cell}>
                      <button
                        type="button"
                        onClick={() => { setPlaying(false); setIdx(i); }}
                        className={cx('rounded-md px-2 py-0.5 font-sans text-xs font-bold', current ? 'bg-nl-blue text-white' : 'bg-slate-100 text-nl-muted hover:bg-nl-softblue')}
                        aria-label={`Go to ${i === 0 ? 'initial state' : `iteration ${i}`}`}
                      >
                        {i === 0 ? 'Init' : i}
                      </button>
                    </td>
                    {i === 0 ? (
                      <>
                        <td className={cx(cell, 'text-slate-300')} colSpan={6}>&mdash;</td>
                      </>
                    ) : (
                      <>
                        <td className={cx(cell, dim)}>{visible ? s.before.A : '···'}</td>
                        <td className={cx(cell, dim)}>{visible ? s.before.Q : '···'}</td>
                        <td className={cx(cell, dim)}>{visible ? s.before.Qm1 : '·'}</td>
                        <td className={cx(cell, dim, 'font-semibold text-blue-700')}>{visible ? s.pair : '··'}</td>
                        <td className={cx(cell, dim, 'font-sans')}>{visible ? s.opLabel : '···'}</td>
                        <td className={cx(cell, dim)}>{visible ? (s.op === 'shift' ? '—' : s.afterOp) : '···'}</td>
                      </>
                    )}
                    <td className={cx(cell, visible ? 'font-semibold text-blue-700' : 'text-slate-300')}>{visible ? s.A : '···'}</td>
                    <td className={cx(cell, visible ? 'font-semibold text-violet-700' : 'text-slate-300')}>{visible ? s.Q : '···'}</td>
                    <td className={cx(cell, dim)}>{visible ? s.Qm1 : '·'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-nl-muted">Select a step number to jump to it. An extra leading bit under Add / subtract marks a sum that needed n + 1 bits.</p>
      </Card>

      {/* ---------- Final result ---------- */}
      <Card className={cx('p-5 transition-opacity sm:p-6', !finished && 'opacity-60')}>
        <SectionTitle action={finished ? <Badge tone={run.matches ? 'green' : 'amber'}>{run.matches ? 'Cross-check passed' : 'Cross-check failed'}</Badge> : null}>
          Final product
        </SectionTitle>
        {finished ? (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-nl-muted">
              {run.multiplicand.toString()} &times; {run.multiplier.toString()} = <strong className="num text-nl-ink">{run.product.toString()}</strong>. The{' '}
              {run.bits * 2}-bit product is the final A register followed by the final Q register. The cross-check compares it with a direct multiplication and plays no part in the steps above.
            </p>
            <ResultGrid items={resultItems} highlightId="bin" />
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-nl-muted">The product appears after the last iteration.</p>
            <Button variant="soft" icon={FastForward} onClick={() => { setPlaying(false); setIdx(last); }}>
              Jump to the result
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
