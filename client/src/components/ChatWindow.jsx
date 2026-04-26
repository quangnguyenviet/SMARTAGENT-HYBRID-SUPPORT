import { useState, useEffect, useRef } from 'react';
import chatService from '../services/chatService';

export default function ChatWindow({ isWidget = false }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [conversationId, setConversationId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [customerId] = useState(Math.floor(Math.random() * 10000)); // ID ngẫu nhiên cho khách mới
  const messagesEndRef = useRef(null);
  const initialized = useRef(false);

  // Khởi tạo hội thoại
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      init();
    }
    return () => {
      if (!isWidget) chatService.disconnect();
    };
  }, [isWidget]);

  async function init() {
    try {
      setLoading(true);
      const conv = await chatService.createConversation(customerId, 'web');
      setConversationId(conv.id);
      
      const history = await chatService.getConversationHistory(conv.id);
      setMessages(history.map(m => ({
        id: m.id,
        sender: m.sender,
        senderType: m.senderType,
        content: m.content,
        timestamp: new Date(m.timestamp).toLocaleTimeString()
      })));

      await chatService.connectWebSocket(conv.id);
    } catch (err) {
      console.error("Lỗi khởi tạo chat:", err);
    } finally {
      setLoading(false);
    }
  }

  // Lắng nghe tin nhắn mới
  useEffect(() => {
    chatService.onMessage((msg) => {
      if (msg.eventType === 'connection_established') {
        setConnected(true);
      } else {
        const newMsg = {
          id: msg.id || Date.now(),
          sender: msg.sender,
          senderType: msg.senderType,
          content: msg.content,
          timestamp: new Date().toLocaleTimeString()
        };
        setMessages(prev => {
          if (prev.some(m => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
      }
    });
    return () => chatService.clearListeners();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputValue.trim() || !conversationId) return;

    chatService.sendWebSocketMessage(conversationId, 'Khách hàng', 'user', inputValue);
    setInputValue('');
  };

  return (
    <div className={`flex flex-col w-full ${isWidget ? 'h-full bg-slate-900/50' : 'mx-auto min-h-[calc(100vh-100px)] max-w-5xl px-4 py-6'}`}>
      
      {/* Header trạng thái */}
      <div className="flex items-center justify-between px-4 py-2 bg-white/5 rounded-t-2xl border-b border-white/10">
        <span className="text-[10px] uppercase tracking-widest text-slate-400">
          {conversationId ? `Hội thoại #${conversationId}` : 'Đang khởi tạo...'}
        </span>
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${connected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
          <span className="text-[10px] text-slate-300">{connected ? 'Đã kết nối' : 'Mất kết nối'}</span>
        </div>
      </div>

      {/* Nội dung chat */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center opacity-50">
            <div className="mb-4 text-4xl">👋</div>
            <p className="text-sm text-slate-300">Chào bạn! Chúng tôi có thể giúp gì cho bạn?</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.senderType === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                msg.senderType === 'user' 
                  ? 'bg-cyan-500 text-slate-950 rounded-tr-none' 
                  : msg.senderType === 'agent'
                    ? 'bg-indigo-600 text-white rounded-tl-none'
                    : 'bg-slate-800 text-slate-100 rounded-tl-none'
              }`}>
                <p>{msg.content}</p>
                <p className="mt-1 text-[9px] opacity-50 text-right">{msg.timestamp}</p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Ô nhập liệu - Luôn hiển thị */}
      <div className="p-4 border-t border-white/10 bg-slate-950/30">
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Nhập tin nhắn..."
            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:border-cyan-400 outline-none"
          />
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="rounded-xl bg-cyan-400 px-4 py-2 text-slate-950 font-bold text-sm hover:bg-cyan-300 disabled:opacity-50"
          >
            Gửi
          </button>
        </form>
      </div>
    </div>
  );
}
