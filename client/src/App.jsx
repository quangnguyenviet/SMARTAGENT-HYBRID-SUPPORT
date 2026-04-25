import { BrowserRouter, Navigate, NavLink, Route, Routes } from 'react-router-dom';
import ChatWindow from './components/ChatWindow';
import AdminDashboard from './components/AdminDashboard';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">SmartAgent</p>
              <h1 className="text-xl font-semibold text-white">Hybrid Support Console</h1>
            </div>

            <nav className="flex rounded-full border border-white/10 bg-white/5 p-1 text-sm">
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 transition ${isActive ? 'bg-cyan-400 text-slate-950' : 'text-slate-300 hover:text-white'}`
                }
              >
                Admin
              </NavLink>
              <NavLink
                to="/chat"
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 transition ${isActive ? 'bg-cyan-400 text-slate-950' : 'text-slate-300 hover:text-white'}`
                }
              >
                Customer
              </NavLink>
            </nav>
          </div>
        </header>

        <main>
          <Routes>
            <Route path="/" element={<Navigate to="/admin" replace />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/chat" element={<ChatWindow />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
