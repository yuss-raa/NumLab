import { Calculator, Cpu, History, Info, LayoutDashboard, Menu, Moon, Sun, X } from 'lucide-react';
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

/** Light/dark switch. `compact` shows only the icon. */
export function ThemeToggle({ theme, onToggle, compact = false }) {
  const dark = theme === 'dark';
  const Icon = dark ? Sun : Moon;
  const label = dark ? 'Switch to light mode' : 'Switch to dark mode';
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={label}
      title={label}
      className={
        compact
          ? 'flex h-10 w-10 items-center justify-center rounded-xl border border-nl-border text-nl-ink transition-colors hover:bg-nl-bg'
          : 'flex w-full items-center gap-3 rounded-xl border border-nl-border px-3.5 py-2.5 text-sm font-medium text-nl-muted transition-colors hover:bg-nl-bg hover:text-nl-ink'
      }
    >
      <Icon className={compact ? 'h-5 w-5' : 'h-[18px] w-[18px]'} aria-hidden="true" />
      {!compact && (dark ? 'Light mode' : 'Dark mode')}
    </button>
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
    <div className="flex h-full flex-col justify-between gap-6 p-5 overflow-y-auto">
      <div className="flex flex-col gap-8">
        <Logo />
        <NavList page={page} onNavigate={onNavigate} />
      </div>
      <div className="rounded-xl bg-nl-softpurple/70 p-4">
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
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-nl-border bg-nl-card lg:block">
        <SidebarBody page={page} onNavigate={onNavigate} />
      </aside>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-xs"
          />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-nl-card shadow-lift overflow-y-auto">
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

/** Responsive top bar across all screens with mode switcher in the top right corner. */
export function TopBar({ page, onOpenNav, theme, onToggleTheme }) {
  const pageTitles = {
    dashboard: 'Dashboard',
    multiplier: 'Arithmetic & Multiplier',
    booth: 'Booth Algorithm Analyser',
    history: 'Calculation History',
    about: 'About Project',
  };

  const dark = theme === 'dark';
  const Icon = dark ? Sun : Moon;
  const label = dark ? 'Light mode' : 'Dark mode';

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-nl-border bg-nl-card/90 px-4 backdrop-blur sm:px-6 lg:px-10">
      {/* Mobile: Hamburger and Logo */}
      <div className="flex items-center gap-3 lg:hidden">
        <button
          type="button"
          onClick={onOpenNav}
          aria-label="Open menu"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-nl-border text-nl-ink transition-colors hover:bg-nl-bg"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>
        <Logo />
      </div>

      {/* Desktop: Breadcrumb */}
      <div className="hidden items-center gap-2 lg:flex">
        <span className="text-xs font-semibold uppercase tracking-wider text-nl-muted">Workbench</span>
        <span className="text-nl-muted">/</span>
        <span className="text-sm font-bold text-nl-ink">{pageTitles[page] || 'Workbench'}</span>
      </div>

      {/* Top right corner: Mode Switcher */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onToggleTheme}
          aria-label={`Switch to ${label}`}
          title={`Switch to ${label}`}
          className="flex h-10 items-center gap-2 rounded-xl border border-nl-border bg-nl-card px-3 sm:px-3.5 text-xs font-semibold text-nl-ink shadow-xs transition-colors hover:border-blue-300 hover:bg-nl-softblue hover:text-blue-700"
        >
          <Icon className={cx('h-4 w-4', dark ? 'text-amber-400' : 'text-nl-blue')} aria-hidden="true" />
          <span className="font-medium">{label}</span>
        </button>
      </div>
    </header>
  );
}

// Keep MobileBar export for backwards compatibility
export const MobileBar = TopBar;