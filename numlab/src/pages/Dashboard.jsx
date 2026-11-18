import { ArrowRight, Calculator, Cpu, History as HistoryIcon, Sparkles } from 'lucide-react';
import { Badge, Card, SectionTitle } from '../components/ui.jsx';
import { ARITHMETIC_EXAMPLES, BOOTH_EXAMPLES } from '../data/examples.js';
import { NUMBER_SYSTEMS, convertAll } from '../utils/numberSystems.js';
import { describeEntry, SUBSCRIPT } from '../utils/format.js';
import { formatTimestamp } from '../utils/history.js';

const SHOWCASE = convertAll(163n);

function ModuleCard({ icon: Icon, tone, title, description, tags, cta, onClick }) {
  const tones = {
    blue: { tile: 'bg-nl-softblue text-nl-blue', wash: 'from-nl-softblue/60', link: 'text-blue-700' },
    purple: { tile: 'bg-nl-softpurple text-nl-lavender', wash: 'from-nl-softpurple/70', link: 'text-violet-700' },
  }[tone];
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative overflow-hidden rounded-2xl border border-nl-border bg-linear-to-br ${tones.wash} to-nl-card p-6 text-left shadow-card transition duration-200 hover:-translate-y-0.5 hover:shadow-lift`}
    >
      <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${tones.tile}`}>
        <Icon className="h-6 w-6" aria-hidden="true" />
      </span>
      <h3 className="mt-5 text-lg font-bold text-nl-ink">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-nl-muted">{description}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Badge key={tag} tone="slate" className="bg-nl-card/80">
            {tag}
          </Badge>
        ))}
      </div>
      <span className={`mt-5 inline-flex items-center gap-1.5 text-sm font-semibold ${tones.link}`}>
        {cta}
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
      </span>
    </button>
  );
}

export default function Dashboard({ entries, onNavigate }) {
  const recent = entries.slice(0, 4);

  return (
    <div className="flex flex-col gap-8">
      <header>
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-nl-lavender">
          Computer Organization and Architecture
        </p>
        <h1 className="max-w-3xl text-3xl font-extrabold leading-tight tracking-tight text-nl-ink sm:text-4xl [text-wrap:balance]">
          Explore Digital Arithmetic with NumLab
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-nl-muted">
          Convert between binary, octal, decimal and hexadecimal, run arithmetic on mixed-format numbers, and
          follow Booth's algorithm one register at a time to see how a processor multiplies signed integers.
        </p>
      </header>

      <div className="grid gap-5 md:grid-cols-2">
        <ModuleCard
          icon={Calculator}
          tone="blue"
          title="Arithmetic Operations"
          description="Add, subtract and multiply two operands that each use their own number system, then read the answer in all four bases."
          tags={['Binary', 'Octal', 'Decimal', 'Hexadecimal']}
          cta="Open Multiplier"
          onClick={() => onNavigate('multiplier')}
        />
        <ModuleCard
          icon={Cpu}
          tone="purple"
          title="Booth Algorithm Analyser"
          description="Step through signed binary multiplication with the A, Q and Q−1 registers, the active rule and a plain-language explanation of every shift."
          tags={['Two’s complement', 'Step by step', 'Up to 32 bits']}
          cta="Open Booth Analyser"
          onClick={() => onNavigate('booth')}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <Card className="p-5 sm:p-6">
          <SectionTitle icon={Sparkles}>Quick access examples</SectionTitle>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-nl-muted">Arithmetic</p>
              <div className="flex flex-col gap-2">
                {ARITHMETIC_EXAMPLES.map((example) => (
                  <button
                    key={example.id}
                    type="button"
                    onClick={() => onNavigate('multiplier', example)}
                    className="flex items-center justify-between gap-2 rounded-xl border border-nl-border bg-nl-bg/60 px-3.5 py-2.5 text-left font-mono text-sm text-nl-ink transition-colors hover:border-blue-200 hover:bg-nl-softblue"
                  >
                    {example.label}
                    <ArrowRight className="h-4 w-4 shrink-0 text-nl-muted" aria-hidden="true" />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-nl-muted">Booth's algorithm</p>
              <div className="flex flex-col gap-2">
                {BOOTH_EXAMPLES.map((example) => (
                  <button
                    key={example.id}
                    type="button"
                    onClick={() => onNavigate('booth', example)}
                    className="flex items-center justify-between gap-2 rounded-xl border border-nl-border bg-nl-bg/60 px-3.5 py-2.5 text-left font-mono text-sm text-nl-ink transition-colors hover:border-violet-200 hover:bg-nl-softpurple"
                  >
                    {example.label}
                    <ArrowRight className="h-4 w-4 shrink-0 text-nl-muted" aria-hidden="true" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <SectionTitle
            icon={HistoryIcon}
            action={
              <button
                type="button"
                onClick={() => onNavigate('history')}
                className="text-sm font-semibold text-nl-blue hover:underline"
              >
                View all
              </button>
            }
          >
            Recent calculations
          </SectionTitle>
          {recent.length === 0 ? (
            <div className="rounded-xl border border-dashed border-nl-border bg-nl-bg/50 p-5 text-center">
              <p className="text-sm font-semibold text-nl-ink">Nothing here yet</p>
              <p className="mt-1 text-sm text-nl-muted">Run a calculation or a Booth example and it will be listed here.</p>
            </div>
          ) : (
            <ul className="flex flex-col divide-y divide-nl-border">
              {recent.map((entry) => (
                <li key={entry.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="truncate font-mono text-sm font-medium text-nl-ink">{describeEntry(entry)}</p>
                    <p className="text-xs text-nl-muted">
                      {entry.operation} &middot; {formatTimestamp(entry.timestamp)}
                    </p>
                  </div>
                  <p className="num shrink-0 font-mono text-sm font-bold text-blue-700">= {entry.result.dec}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card className="p-5 sm:p-6">
        <SectionTitle>Supported number systems</SectionTitle>
        <p className="mb-4 text-sm text-nl-muted">
          The same value, 163 in decimal, written in each system: <span className="font-mono text-nl-ink">{SHOWCASE.dec}</span>
          {SUBSCRIPT.dec} = <span className="font-mono text-nl-ink">{SHOWCASE.bin}</span>
          {SUBSCRIPT.bin} = <span className="font-mono text-nl-ink">{SHOWCASE.oct}</span>
          {SUBSCRIPT.oct} = <span className="font-mono text-nl-ink">{SHOWCASE.hex}</span>
          {SUBSCRIPT.hex}.
        </p>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {NUMBER_SYSTEMS.map((system, index) => (
            <div key={system.id} className="rounded-xl border border-nl-border bg-nl-bg/50 p-4">
              <div className="flex items-center justify-between">
                <p className="font-bold text-nl-ink">{system.label}</p>
                <Badge tone={index % 2 ? 'purple' : 'blue'}>Base {system.radix}</Badge>
              </div>
              <p className="mt-2 text-xs text-nl-muted">Digits {system.digits}</p>
              <p className="num mt-3 font-mono text-lg font-semibold text-nl-ink">{SHOWCASE[system.id]}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
