import React, { useState } from 'react';
import ChatWindow from './ChatWindow';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
      {/* Chat Window Popup */}
      <div className={`${isOpen ? 'flex' : 'hidden'} mb-4 h-[600px] w-[400px] max-w-[calc(100vw-48px)] overflow-hidden rounded-3xl border border-white/10 bg-slate-900/95 shadow-2xl shadow-black/50 backdrop-blur-2xl animate-in fade-in slide-in-from-bottom-10 duration-300 flex-col`}>
        {/* Header nhỏ gọn cho Widget */}
        <div className="flex items-center justify-between border-b border-white/10 bg-gradient-to-r from-cyan-500/10 to-indigo-500/10 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-10 w-10 rounded-full bg-cyan-400/20 p-2 text-center text-xl">🤖</div>
              <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-slate-900 bg-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">SmartAgent Assistant</h3>
              <p className="text-[10px] text-emerald-400">Đang trực tuyến</p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/XInclude" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m18 15-6-6-6 6"/>
            </svg>
          </button>
        </div>

        {/* Body chứa ChatWindow component (đã được tinh chỉnh class để khớp) */}
        <div className="flex-1 overflow-hidden widget-chat-container">
          <ChatWindow isWidget={true} />
        </div>
      </div>

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`group relative flex h-16 w-16 items-center justify-center rounded-full shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 ${
          isOpen ? 'bg-slate-800 text-white rotate-90' : 'bg-gradient-to-br from-cyan-400 to-indigo-600 text-slate-950'
        }`}
      >
        <div className="absolute -inset-2 rounded-full bg-cyan-400/20 opacity-0 blur transition group-hover:opacity-100" />
        
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/>
          </svg>
        )}
      </button>
    </div>
  );
};

export default ChatWidget;
