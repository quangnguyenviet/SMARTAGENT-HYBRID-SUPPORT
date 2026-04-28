import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import ChatWindow from './components/ChatWindow';
import AdminDashboard from './components/AdminDashboard';
import BotSettings from './components/BotSettings';
import LandingPage from './components/LandingPage';
import ChatWidget from './components/ChatWidget';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <Routes>
          {/* Giao diện khách hàng: Landing Page + Chat Widget */}
          <Route path="/" element={
            <>
              <LandingPage />
              <ChatWidget />
            </>
          } />
          
          {/* Giao diện Admin: Dashboard & Cấu hình */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/settings" element={<BotSettings />} />
          
          {/* Route cũ để tương thích (nếu muốn) */}
          <Route path="/chat" element={<ChatWindow />} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
