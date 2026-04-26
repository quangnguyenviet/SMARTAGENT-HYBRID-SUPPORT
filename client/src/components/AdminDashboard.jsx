import { useEffect, useMemo, useRef, useState } from 'react';
import chatService from '../services/chatService';
import { Client } from '@stomp/stompjs';

function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString();
}

function getStatusClass(status) {
  const normalized = String(status || '').toUpperCase();
  if (normalized === 'ACTIVE') return 'bg-emerald-400/15 text-emerald-300 ring-1 ring-emerald-400/30';
  if (normalized === 'CLOSED') return 'bg-slate-400/15 text-slate-300 ring-1 ring-slate-400/20';
  if (normalized === 'HANDED_OVER') return 'bg-rose-500/20 text-rose-300 ring-1 ring-rose-500/50 animate-pulse';
  return 'bg-cyan-400/15 text-cyan-300 ring-1 ring-cyan-400/30';
}

function getConversationInsights(conversation) {
  if (!conversation) return null;
  
  const score = conversation.leadScore || 0;
  const isHandedOver = conversation.status === 'HANDED_OVER' || !conversation.isBotActive;
  
  // Ưu tiên dữ liệu thật từ AI Backend
  const intent = conversation.intentSummary || (isHandedOver ? 'Cần hỗ trợ trực tiếp' : 'Đang tìm hiểu');
  const sentiment = conversation.sentiment || (score >= 30 ? 'Tích cực 😊' : 'Trung lập 😐');
  
  let color = 'text-cyan-400';
  if (isHandedOver || score >= 50) color = 'text-rose-400';
  else if (score >= 15) color = 'text-emerald-400';

  return {
    intent,
    sentiment,
    color,
    suggestions: isHandedOver ? ['Xin lỗi khách hàng', 'Hỏi số điện thoại'] : ['Tư vấn tính năng', 'Gửi báo giá']
  };
}

export default function AdminDashboard() {
  const [conversations, setConversations] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [inboxTab, setInboxTab] = useState('care'); // 'care' | 'all'
  const selectedConversationIdRef = useRef(null);
  const messagesEndRef = useRef(null);

  const selectedConversation = useMemo(
    () => conversations.find((item) => item.id === selectedConversationId) || null,
    [conversations, selectedConversationId]
  );

  // Conversations cần chăm sóc: HANDED_OVER, COLLECTING_CONTACT, hoặc bot đã tắt
  const needsCareConversations = useMemo(
    () => conversations.filter(c =>
      c.status === 'HANDED_OVER' ||
      c.status === 'COLLECTING_CONTACT' ||
      c.isBotActive === false
    ),
    [conversations]
  );

  const filteredConversations = inboxTab === 'care' ? needsCareConversations : conversations;

  const insights = useMemo(() => getConversationInsights(selectedConversation), [selectedConversation]);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    selectedConversationIdRef.current = selectedConversationId;
    if (selectedConversationId) {
      loadMessages(selectedConversationId);
    }
  }, [selectedConversationId]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // STOMP WebSocket for realtime updates
  useEffect(() => {
    chatService.connectAdminWebSocket((event) => {
      handleAdminEvent(event);
    }).catch(err => console.error('Admin STOMP error', err));

    return () => chatService.disconnect();
  }, []);

  function handleAdminEvent(event) {
    if (!event || !event.eventType) return;

    if (event.eventType === 'CONVERSATION_CREATED') {
      setConversations(prev => {
        if (prev.some(c => c.id === event.conversation.id)) return prev;
        return [event.conversation, ...prev];
      });
    } 
    else if (event.eventType === 'CONVERSATION_UPDATED' || event.eventType === 'LEAD_SCORE_UPDATED') {
      // Dùng chung cho update status và lead_score
      if (!event.conversation) return;
      setConversations(prev => {
        const updated = prev.map(c => c.id === event.conversation.id ? event.conversation : c);
        return updated.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      });
    }
    else if (event.eventType === 'NEW_MESSAGE') {
      setConversations(prev => {
        let exists = false;
        const updated = prev.map(c => {
          if (c.id === event.conversation.id) {
            exists = true;
            return event.conversation;
          }
          return c;
        });
        if (!exists) updated.push(event.conversation);
        return updated.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      });

      if (selectedConversationIdRef.current === event.conversation.id && event.message) {
        setMessages(prev => {
          if (prev.some(m => m.id === event.message.id)) return prev;
          return [...prev, event.message];
        });
      }
    }
  }

  async function loadConversations(silent = false) {
    if (!silent) setLoadingConversations(true);
    setError('');
    try {
      const data = await chatService.getAllConversations();
      setConversations(data);
      if (data.length > 0 && !selectedConversationId) {
        setSelectedConversationId(data[0].id);
      }
    } catch (err) {
      setError('Failed to load conversations');
      console.error(err);
    } finally {
      if (!silent) setLoadingConversations(false);
    }
  }

  async function loadMessages(conversationId, silent = false) {
    if (!conversationId) return;
    if (!silent) setLoadingMessages(true);
    try {
      const data = await chatService.getConversationHistory(conversationId);
      setMessages(data);
    } catch (err) {
      console.error(err);
      setMessages([]);
    } finally {
      if (!silent) setLoadingMessages(false);
    }
  }

  const handleTakeOver = async () => {
    if (!selectedConversation) return;
    
    console.log("Taking over conversation:", selectedConversation.id);
    const success = await chatService.takeOver(selectedConversation.id, 1); // Mock agentId = 1
    
    if (success) {
      console.log("Take over successful");
    } else {
      alert("Giành quyền thất bại, vui lòng thử lại.");
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    console.log("Admin sending message:", newMessage);
    
    // Gửi tin nhắn admin qua WebSocket
    // Chúng ta giả định agentId = 1 (Nhân viên)
    chatService.sendWebSocketMessage(
      selectedConversation.id,
      "Nhân viên hỗ trợ",
      "agent",
      newMessage
    );

    setNewMessage('');
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header riêng cho Admin */}
      <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">SmartAgent Admin</p>
            <h1 className="text-xl font-semibold text-white">Hybrid Support Console</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            <span className="text-sm font-medium text-emerald-400">Hệ thống sẵn sàng</span>
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-[1600px] grid-cols-1 gap-4 px-4 py-4 lg:grid-cols-[340px_1fr_320px] lg:px-6 overflow-hidden" style={{ height: 'calc(100vh - 73px)' }}>
        
        {/* CỘT 1: SMART INBOX */}
        <aside className="flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-slate-900/80 shadow-2xl shadow-cyan-950/20 backdrop-blur-xl">
          {/* Header */}
          <div className="border-b border-white/10 px-5 pt-4 pb-0">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.28em] text-cyan-300/80">Smart Inbox</p>
                <h2 className="text-lg font-semibold text-white">Khách Hàng</h2>
              </div>
              <button
                onClick={() => loadConversations(true)}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:bg-white/10"
              >
                Làm mới
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1">
              <button
                onClick={() => setInboxTab('care')}
                className={`relative flex-1 rounded-t-xl px-3 py-2 text-xs font-bold transition ${
                  inboxTab === 'care'
                    ? 'bg-rose-500/15 text-rose-300 border-t border-l border-r border-rose-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Cần Chăm Sóc
                {needsCareConversations.length > 0 && (
                  <span className={`ml-1.5 inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                    inboxTab === 'care' ? 'bg-rose-500 text-white' : 'bg-slate-700 text-slate-300'
                  }`}>
                    {needsCareConversations.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setInboxTab('all')}
                className={`relative flex-1 rounded-t-xl px-3 py-2 text-xs font-bold transition ${
                  inboxTab === 'all'
                    ? 'bg-white/5 text-white border-t border-l border-r border-white/10'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Tất Cả
                <span className={`ml-1.5 inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                  inboxTab === 'all' ? 'bg-slate-600 text-slate-200' : 'bg-slate-700 text-slate-400'
                }`}>
                  {conversations.length}
                </span>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            {loadingConversations ? (
              <div className="px-4 py-8 text-center text-slate-400">Đang tải...</div>
            ) : filteredConversations.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-8 text-center text-slate-400">
                {inboxTab === 'care' ? (
                  <>
                    <div className="text-2xl mb-2">✅</div>
                    <p>Không có khách cần chăm sóc!</p>
                  </>
                ) : 'Chưa có hội thoại nào.'}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredConversations.map((conversation) => {
                  const isSelected = conversation.id === selectedConversationId;
                  const score = conversation.leadScore || 0;
                  const botActive = conversation.isBotActive !== false;

                  return (
                    <button
                      key={conversation.id}
                      onClick={() => setSelectedConversationId(conversation.id)}
                      className={`w-full rounded-2xl border p-4 text-left transition ${
                        isSelected
                          ? 'border-cyan-400/40 bg-cyan-400/10 shadow-lg shadow-cyan-950/20'
                          : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.07]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-white">Khách hàng #{conversation.customerId}</span>
                          <div className="mt-1 flex items-center gap-2">
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${botActive ? 'bg-blue-500/20 text-blue-300' : 'bg-rose-500/20 text-rose-300 border border-rose-500/50 animate-pulse'}`}>
                              {botActive ? '🤖 Bot Auto' : '👩‍💼 Cần Chăm Sóc'}
                            </span>
                          </div>
                        </div>
                        
                        {/* Lửa thể hiện độ "Hot" của Lead */}
                        <div className="flex flex-col items-end">
                          <span className={`text-lg font-bold flex items-center gap-1 ${score >= 50 ? 'text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]' : score >= 15 ? 'text-amber-500' : 'text-slate-500'}`}>
                            {score} <span className="text-sm">🔥</span>
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-2 text-[11px] text-slate-400">
                        <span className="truncate">{conversation.channel || 'Web'}</span>
                        <span>{formatDate(conversation.updatedAt)}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </aside>

        {/* CỘT 2: KHÔNG GIAN CHAT (ACTIVE WORKSPACE) */}
        <section className="flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-slate-900/80 shadow-2xl shadow-cyan-950/20 backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 bg-slate-900/50">
            <div>
              <p className="text-[10px] uppercase tracking-[0.28em] text-cyan-300/80">Workspace</p>
              <h2 className="text-lg font-semibold text-white">
                {selectedConversation ? `Hội thoại #${selectedConversation.id}` : 'Chưa chọn hội thoại'}
              </h2>
            </div>
            
            {/* Nút TAKE OVER Khổng lồ */}
            {selectedConversation && selectedConversation.isBotActive !== false && (
              <button 
                onClick={handleTakeOver}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 px-4 py-2 font-bold text-white shadow-lg shadow-rose-500/30 transition hover:scale-105 hover:shadow-rose-500/50"
              >
                <span>⚡</span> TAKE OVER
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-slate-900 to-cyan-950/20">
            {!selectedConversation ? (
              <div className="flex h-full items-center justify-center text-slate-500">
                Chọn một khách hàng bên trái để bắt đầu.
              </div>
            ) : loadingMessages ? (
              <div className="flex h-full items-center justify-center text-slate-500">Đang tải tin nhắn...</div>
            ) : (
              <>
                {messages.map((message) => {
                  const isUser = String(message.senderType || '').toLowerCase() === 'user';
                  const isBot = String(message.senderType || '').toLowerCase() === 'bot';

                  return (
                    <div key={message.id} className={`flex ${isUser ? 'justify-start' : 'justify-end'}`}>
                      <div className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-lg ${
                        isUser 
                          ? 'bg-slate-800 border border-white/10 text-slate-200 rounded-tl-none' 
                          : isBot 
                            ? 'bg-cyan-950/50 border border-cyan-500/30 text-cyan-50 rounded-tr-none'
                            : 'bg-indigo-600 border border-indigo-400 text-white rounded-tr-none' // Nhân viên
                      }`}>
                        <div className="mb-1 flex items-center justify-between gap-4 text-[10px] opacity-70">
                          <span className="font-bold uppercase tracking-wider text-cyan-300">
                            {isBot ? '🤖 AI Assistant' : message.sender || 'Customer'}
                          </span>
                          <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Khung nhập liệu */}
          {selectedConversation && (
            <div className="border-t border-white/10 bg-slate-900/50 p-4">
              <form onSubmit={handleSendMessage} className="relative flex items-center">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={selectedConversation.isBotActive !== false ? "Vui lòng bấm 'TAKE OVER' để nhắn tin..." : "Nhập tin nhắn hỗ trợ khách hàng..."}
                  disabled={selectedConversation.isBotActive !== false}
                  className="w-full rounded-2xl border border-white/10 bg-slate-800/50 py-3 pl-4 pr-12 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || selectedConversation.isBotActive !== false}
                  className="absolute right-2 flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500 text-white transition hover:bg-cyan-400 disabled:opacity-50"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </form>
            </div>
          )}
        </section>

        {/* CỘT 3: AI INSIGHTS (ORCHESTRATOR) */}
        <aside className="flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-slate-900/80 shadow-2xl shadow-cyan-950/20 backdrop-blur-xl">
          <div className="border-b border-white/10 px-5 py-4 bg-gradient-to-r from-slate-900 to-indigo-950/30">
            <p className="text-[10px] uppercase tracking-[0.28em] text-indigo-300/80">AI Orchestrator</p>
            <h2 className="text-lg font-semibold text-white">Mật Vụ Phân Tích</h2>
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            {!selectedConversation ? (
              <div className="text-center text-sm text-slate-500 mt-10">
                Đang chờ dữ liệu AI...
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* Intent & Value */}
                <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                  <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">Hồ Sơ Tiềm Năng</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-[10px] uppercase text-slate-500">Ý Định (Intent)</p>
                      <p className={`text-sm font-semibold ${insights?.color}`}>{insights?.intent}</p>
                    </div>
                  </div>
                </div>

                {/* Sentiment */}
                <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                  <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">Phân Tích Cảm Xúc</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl">{insights?.sentiment.split(' ')[1]}</span>
                    <span className={`text-sm font-semibold ${insights?.color}`}>
                      {insights?.sentiment.split(' ')[0]}
                    </span>
                  </div>
                </div>

                {/* Quick Replies */}
                <div className="rounded-2xl border border-cyan-500/20 bg-cyan-950/20 p-4 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>
                  <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-cyan-300">🤖 AI Gợi Ý Trả Lời</h3>
                  <div className="space-y-2">
                    {insights?.suggestions.map((suggestion, idx) => (
                      <button 
                        key={idx}
                        className="w-full rounded-xl border border-cyan-500/30 bg-slate-900/50 px-3 py-2 text-left text-xs text-cyan-100 transition hover:bg-cyan-500/20 hover:border-cyan-400"
                      >
                        "{suggestion}"
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}