import { Calculator, Cpu, History, Info, LayoutDashboard, Menu, X } from 'lucide-react';
import { cx } from './ui.jsx';

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'multiplier', label: 'Multiplier', icon: Calculator },
  { id: 'booth', label: 'Booth Analyser', icon: Cpu },
  { id: 'history', label: 'History', icon: History },
  { id: 'about', label: 'About Project', icon: Info },
];

export function Logo() {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-nl-blue to-nl-lavender text-white shadow-lift">
        <Cpu className="h-5 w-5" aria-hidden="true" />
      </span>
      <div className="leading-tight">
        <p className="text-lg font-extrabold tracking-tight text-nl-ink">NumLab</p>
        <p className="text-[11px] font-medium text-nl-muted">Digital Arithmetic Workbench</p>
      </div>
    </div>
  );
}

function NavList({ page, onNavigate }) {
  return (
    <nav aria-label="Main" className="flex flex-col gap-1">
      {NAV_ITEMS.map((item) => {
        const active = item.id === page;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onNavigate(item.id)}
            aria-current={active ? 'page' : undefined}
            className={cx(
              'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm transition-colors duration-150',
              active
                ? 'bg-nl-softblue font-semibold text-blue-700'
                : 'font-medium text-nl-muted hover:bg-nl-softpurple/60 hover:text-nl-ink',
            )}
          >
            <item.icon className="h-[18px] w-[18px]" aria-hidden="true" />
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}

function SidebarBody({ page, onNavigate }) {
  return (
    <div className="flex h-full flex-col gap-8 p-5">
      <Logo />
      <NavList page={page} onNavigate={onNavigate} />
      <div className="mt-auto rounded-xl bg-nl-softpurple/70 p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-violet-700">COA project</p>
        <p className="mt-1 text-xs leading-relaxed text-nl-muted">
          Computer Organization and Architecture. Number systems, ALU arithmetic and Booth's algorithm.
        </p>
      </div>
    </div>
  );
}

/** Fixed sidebar on large screens, slide-over drawer below. */
export default function Sidebar({ page, onNavigate, open, onClose }) {
  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-nl-border bg-white lg:block">
        <SidebarBody page={page} onNavigate={onNavigate} />
      </aside>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={onClose}
            className="absolute inset-0 bg-nl-ink/30"
          />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-white shadow-lift">
            <button
              type="button"
              onClick={onClose}
              aria-label="Close menu"
              className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-lg text-nl-muted hover:bg-nl-bg"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
            <SidebarBody page={page} onNavigate={onNavigate} />
          </aside>
        </div>
      )}
    </>
  );
}

export function MobileBar({ onOpen }) {
  return (
    <div className="sticky top-0 z-20 flex items-center justify-between border-b border-nl-border bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
      <Logo />
      <button
        type="button"
        onClick={onOpen}
        aria-label="Open menu"
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-nl-border text-nl-ink hover:bg-nl-bg"
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>
    </div>
  );
}
