import { useCallback, useState } from 'react';
import Sidebar, { MobileBar } from './components/Sidebar.jsx';
import { useHistory } from './hooks/useHistory.js';
import About from './pages/About.jsx';
import BoothAnalyser from './pages/BoothAnalyser.jsx';
import Dashboard from './pages/Dashboard.jsx';
import History from './pages/History.jsx';
import Multiplier from './pages/Multiplier.jsx';

export default function App() {
  const [page, setPage] = useState('dashboard');
  const [navOpen, setNavOpen] = useState(false);
  // A sample picked on the Dashboard, applied once by the target page.
  const [preset, setPreset] = useState(null);
  const { entries, add, clear } = useHistory();

  const navigate = useCallback((id, example = null) => {
    setPage(id);
    setPreset(example ? { ...example, target: id, nonce: Date.now() } : null);
    setNavOpen(false);
    window.scrollTo({ top: 0 });
  }, []);

  const presetFor = (id) => (preset && preset.target === id ? preset : null);

  return (
    <div className="min-h-screen bg-nl-bg font-sans text-nl-ink">
      <Sidebar page={page} onNavigate={navigate} open={navOpen} onClose={() => setNavOpen(false)} />
      <div className="lg:pl-64">
        <MobileBar onOpen={() => setNavOpen(true)} />
        <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
          {page === 'dashboard' && <Dashboard entries={entries} onNavigate={navigate} />}
          {page === 'multiplier' && <Multiplier preset={presetFor('multiplier')} onSave={add} />}
          {page === 'booth' && <BoothAnalyser preset={presetFor('booth')} onSave={add} />}
          {page === 'history' && <History entries={entries} onClear={clear} />}
          {page === 'about' && <About />}
        </main>
      </div>
    </div>
  );
}
