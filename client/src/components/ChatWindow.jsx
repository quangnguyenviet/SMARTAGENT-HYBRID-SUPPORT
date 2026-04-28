import { useState, useEffect, useRef } from 'react';
import chatService from '../services/chatService';

export default function ChatWindow({ isWidget = false }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [conversationId, setConversationId] = useState(() => sessionStorage.getItem('smartagent_conv_id'));
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [customerId] = useState(() => {
    const saved = sessionStorage.getItem('smartagent_customer_id');
    if (saved) return saved;
    const newId = `web_${Math.floor(Math.random() * 100000)}`;
    sessionStorage.setItem('smartagent_customer_id', newId);
    return newId;
  });
  const [collectingContact, setCollectingContact] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', phone: '', email: '' });
  const messagesEndRef = useRef(null);
  const initialized = useRef(false);
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const lastTypingSentRef = useRef(0);

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
      let currentId = conversationId;

      if (!currentId) {
        const conv = await chatService.createConversation(customerId, 'web');
        currentId = conv.id;
        setConversationId(currentId);
        sessionStorage.setItem('smartagent_conv_id', currentId);
      }

      const history = await chatService.getConversationHistory(currentId);
      setMessages(history.map(m => ({
        id: m.id,
        sender: m.sender,
        senderType: m.senderType,
        content: m.content,
        timestamp: new Date(m.timestamp).toLocaleTimeString()
      })));

      await chatService.connectWebSocket(currentId);
    } catch (err) {
      console.error('Lỗi khởi tạo chat:', err);
    } finally {
      setLoading(false);
    }
  }

  // Lắng nghe tin nhắn mới
  useEffect(() => {
    chatService.onMessage((msg) => {
      if (msg.eventType === 'connection_established') {
        setConnected(true);
        return;
      }

      if (msg.eventType === 'TYPING_INDICATOR') {
        // Only show if it's from bot or agent (not self)
        if (msg.senderType !== 'user') {
          setIsOtherTyping(msg.content === 'typing');
        }
        return;
      }

      // If senderType = collect_contact → kích hoạt mini-form
      if (msg.senderType === 'collect_contact') {
        const newMsg = {
          id: msg.id || Date.now(),
          sender: msg.sender,
          senderType: 'bot',
          content: msg.content,
          timestamp: new Date().toLocaleTimeString()
        };
        setMessages(prev => prev.some(m => m.id === newMsg.id) ? prev : [...prev, newMsg]);
        setCollectingContact(true);
        setIsOtherTyping(false); // Hide typing when form appears
        return;
      }

      const newMsg = {
        id: msg.id || Date.now(),
        sender: msg.sender,
        senderType: msg.senderType,
        content: msg.content,
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => prev.some(m => m.id === newMsg.id) ? prev : [...prev, newMsg]);
      setIsOtherTyping(false); // Hide typing when message arrives
    });
    return () => chatService.clearListeners();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOtherTyping]);

  // Gửi tin nhắn thường
  const handleSend = (e) => {
    e.preventDefault();
    if (!inputValue.trim() || !conversationId) return;
    
    // Clear typing indicator immediately
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    chatService.sendTypingIndicator(conversationId, 'Khách hàng', 'user', false);
    lastTypingSentRef.current = 0;

    chatService.sendWebSocketMessage(conversationId, 'Khách hàng', 'user', inputValue);
    setInputValue('');
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);

    if (conversationId && connected) {
      const now = Date.now();
      // Throttle typing events: send every 3 seconds while typing
      if (now - lastTypingSentRef.current > 3000) {
        chatService.sendTypingIndicator(conversationId, 'Khách hàng', 'user', true);
        lastTypingSentRef.current = now;
      }

      // Clear previous timeout and set a new one to send "stop typing"
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        chatService.sendTypingIndicator(conversationId, 'Khách hàng', 'user', false);
        lastTypingSentRef.current = 0;
      }, 3000);
    }
  };

  // Submit mini contact form
  const handleContactSubmit = (e) => {
    e.preventDefault();
    const { name, phone, email } = contactForm;

    // Cần ít nhất SĐT hoặc Email
    if (!phone.trim() && !email.trim()) {
      alert('Vui lòng cung cấp số điện thoại hoặc email để nhân viên liên hệ lại!');
      return;
    }

    // Format message đặc biệt để Orchestrator parse
    const parts = [];
    if (name.trim())  parts.push(`Tên: ${name.trim()}`);
    if (phone.trim()) parts.push(`SĐT: ${phone.trim()}`);
    if (email.trim()) parts.push(`Email: ${email.trim()}`);

    const contactMessage = `[CONTACT] ${parts.join(' | ')}`;

    // Thêm tin nhắn vào UI ngay lập tức (hiển thị dạng đẹp cho user)
    const displayContent = parts.join('\n');
    setMessages(prev => [...prev, {
      id: Date.now(),
      sender: 'Khách hàng',
      senderType: 'user',
      content: displayContent,
      timestamp: new Date().toLocaleTimeString()
    }]);

    // Gửi message thực (có prefix [CONTACT]) lên server
    chatService.sendWebSocketMessage(conversationId, 'Khách hàng', 'user', contactMessage);

    // Reset form và ẩn
    setCollectingContact(false);
    setContactForm({ name: '', phone: '', email: '' });
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
                <p style={{ whiteSpace: 'pre-line' }}>{msg.content}</p>
                <p className="mt-1 text-[9px] opacity-50 text-right">{msg.timestamp}</p>
              </div>
            </div>
          ))
        )}

        {/* Typing indicator */}
        {isOtherTyping && (
          <div className="flex justify-start">
            <div className="bg-slate-800 border border-white/10 rounded-2xl rounded-tl-none px-4 py-3 shadow-lg">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ===== MINI CONTACT FORM ===== */}
      {collectingContact ? (
        <div className="p-4 border-t border-white/10 bg-slate-950/30">
          <div className="mb-3 text-xs text-cyan-400 font-semibold uppercase tracking-wider">
            📞 Thông tin liên hệ
          </div>
          <form onSubmit={handleContactSubmit} className="space-y-2">
            <input
              type="text"
              placeholder="Tên của bạn (tuỳ chọn)"
              value={contactForm.name}
              onChange={e => setContactForm(f => ({ ...f, name: e.target.value }))}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:border-cyan-400 outline-none placeholder:text-slate-500"
            />
            <input
              type="tel"
              placeholder="Số điện thoại *"
              value={contactForm.phone}
              onChange={e => setContactForm(f => ({ ...f, phone: e.target.value }))}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:border-cyan-400 outline-none placeholder:text-slate-500"
            />
            <input
              type="email"
              placeholder="Email (tuỳ chọn)"
              value={contactForm.email}
              onChange={e => setContactForm(f => ({ ...f, email: e.target.value }))}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:border-cyan-400 outline-none placeholder:text-slate-500"
            />
            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                className="flex-1 rounded-xl bg-cyan-400 py-2 text-slate-950 font-bold text-sm hover:bg-cyan-300 transition-colors"
              >
                Gửi thông tin ✓
              </button>
              <button
                type="button"
                onClick={() => setCollectingContact(false)}
                className="rounded-xl border border-white/20 px-4 py-2 text-slate-400 text-sm hover:text-white transition-colors"
              >
                Bỏ qua
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Ô nhập liệu thường */
        <div className="p-4 border-t border-white/10 bg-slate-950/30">
          <form onSubmit={handleSend} className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
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
      )}
    </div>
  );
}
