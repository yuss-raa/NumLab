import { Badge, Card, PageHeader, SectionTitle } from '../components/ui.jsx';
import { NUMBER_SYSTEMS } from '../utils/numberSystems.js';

const TECH = [
  ['React', 'Component-based user interface and state management'],
  ['JavaScript (ES2022)', 'Application logic, with BigInt for exact integers'],
  ['Tailwind CSS', 'Utility-first styling and the pastel design system'],
  ['Lucide React', 'Icon set'],
  ['Vite', 'Development server and production build'],
  ['localStorage', 'Calculation history that survives a refresh'],
];

const OUTCOMES = [
  'Convert values between binary, octal, decimal and hexadecimal by hand and in code.',
  'Represent negative integers in two’s complement and recognise when a value overflows a given width.',
  'Explain how an ALU performs addition and subtraction, and how multiplication builds on them.',
  'Trace Booth’s algorithm register by register and say why runs of 1s need only one subtraction and one addition.',
  'Verify a hardware-style algorithm against known test cases.',
];

export default function About() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Module 4"
        title="About NumLab"
        description="A Computer Organization and Architecture (COA) project that shows how number systems and digital arithmetic work inside a processor."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5 sm:p-6">
          <SectionTitle>Introduction</SectionTitle>
          <p className="text-sm leading-relaxed text-nl-muted">
            NumLab: Digital Arithmetic Workbench is an interactive tool for working with numbers the way digital
            hardware does. It has two main modules: a general calculator for mixed-format arithmetic, and a Booth
            Algorithm Analyser that runs signed binary multiplication one iteration at a time. The project
            demonstrates concepts from Computer Organization and Architecture, including data representation, the
            arithmetic logic unit and register-level algorithms.
          </p>
        </Card>
        <Card className="p-5 sm:p-6">
          <SectionTitle>Objective</SectionTitle>
          <p className="text-sm leading-relaxed text-nl-muted">
            To make binary arithmetic visible. The calculator parses each operand in its own base and never treats a
            hexadecimal or binary string as decimal. The analyser implements Booth's algorithm with real register
            operations, so the intermediate values you see are the ones a hardware multiplier would produce.
          </p>
        </Card>
      </div>

      <Card className="p-5 sm:p-6">
        <SectionTitle>Supported number systems</SectionTitle>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[28rem] text-left text-sm">
            <thead className="text-xs uppercase tracking-wider text-nl-muted">
              <tr>
                <th className="pb-2 pr-4 font-semibold">System</th>
                <th className="pb-2 pr-4 font-semibold">Base</th>
                <th className="pb-2 pr-4 font-semibold">Digits</th>
                <th className="pb-2 font-semibold">Example</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-nl-border">
              {NUMBER_SYSTEMS.map((s) => (
                <tr key={s.id}>
                  <td className="py-2.5 pr-4 font-semibold text-nl-ink">{s.label}</td>
                  <td className="py-2.5 pr-4 font-mono text-nl-muted">{s.radix}</td>
                  <td className="py-2.5 pr-4 text-nl-muted">{s.digits}</td>
                  <td className="py-2.5 font-mono text-nl-ink">{s.example}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5 sm:p-6">
          <SectionTitle>Arithmetic operations</SectionTitle>
          <ul className="flex flex-col gap-3 text-sm leading-relaxed text-nl-muted">
            <li>
              <strong className="text-nl-ink">Addition.</strong> Bits are added column by column with a carry into the
              next column, exactly like a ripple-carry adder.
            </li>
            <li>
              <strong className="text-nl-ink">Subtraction.</strong> A &minus; B is computed as A + (&minus;B). In
              hardware the negation is the two's complement: invert the bits and add 1.
            </li>
            <li>
              <strong className="text-nl-ink">Multiplication.</strong> Repeated shifted additions of the multiplicand.
              Booth's algorithm reduces the number of additions for signed numbers.
            </li>
          </ul>
        </Card>
        <Card className="p-5 sm:p-6">
          <SectionTitle>Booth's algorithm</SectionTitle>
          <p className="text-sm leading-relaxed text-nl-muted">
            Booth's algorithm multiplies two signed two's complement integers. It scans the multiplier from right to
            left, looking at each bit together with the bit before it (Q0 and Q&minus;1). A run of 1s is replaced by
            one subtraction at its start and one addition after its end, so long runs cost very little. Every
            iteration finishes with an arithmetic right shift of A, Q and Q&minus;1 that keeps the sign.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              ['00', 'shift'],
              ['01', 'A + M'],
              ['10', 'A − M'],
              ['11', 'shift'],
            ].map(([pair, action]) => (
              <Badge key={pair} tone="purple">
                <span className="font-mono">{pair}</span>&nbsp;&rarr; {action}
              </Badge>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5 sm:p-6">
          <SectionTitle>Technologies used</SectionTitle>
          <dl className="flex flex-col divide-y divide-nl-border text-sm">
            {TECH.map(([name, use]) => (
              <div key={name} className="flex flex-wrap justify-between gap-x-4 gap-y-0.5 py-2.5 first:pt-0 last:pb-0">
                <dt className="font-semibold text-nl-ink">{name}</dt>
                <dd className="text-nl-muted">{use}</dd>
              </div>
            ))}
          </dl>
        </Card>
        <Card className="p-5 sm:p-6">
          <SectionTitle>Learning outcomes</SectionTitle>
          <ul className="flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed text-nl-muted marker:text-nl-lavender">
            {OUTCOMES.map((outcome) => (
              <li key={outcome}>{outcome}</li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
