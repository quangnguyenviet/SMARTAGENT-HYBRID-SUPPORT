import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import chatService from '../services/chatService';

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


export default function AdminDashboard() {
  const [conversations, setConversations] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [inboxTab, setInboxTab] = useState('care'); // 'care' | 'all'
  const [channelFilter, setChannelFilter] = useState('all'); // 'all' | 'web' | 'facebook'
  const [searchQuery, setSearchQuery] = useState(''); // Demo Search
  const selectedConversationIdRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [isCustomerTyping, setIsCustomerTyping] = useState(false);
  const adminTypingTimeoutRef = useRef(null);
  const lastAdminTypingSentRef = useRef(0);
  const [showMobileChat, setShowMobileChat] = useState(false); // Mobile state: list vs chat

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

  const filteredConversations = useMemo(() => {
    let base = inboxTab === 'care' ? needsCareConversations : conversations;
    
    if (channelFilter !== 'all') {
      base = base.filter(c => (c.channel || 'web').toLowerCase() === channelFilter);
    }
    
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      base = base.filter(c => 
        (c.customerName && c.customerName.toLowerCase().includes(q)) || 
        (c.customerId && c.customerId.toLowerCase().includes(q))
      );
    }
    
    return base;
  }, [inboxTab, needsCareConversations, conversations, channelFilter, searchQuery]);


  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    selectedConversationIdRef.current = selectedConversationId;
    setIsCustomerTyping(false); // Reset typing status when conversation changes

    if (selectedConversationId) {
      loadMessages(selectedConversationId);
      markAsRead(selectedConversationId);
      
      // Subscribe to specific conversation for real-time events like TYPING
      chatService.subscribeToConversation(selectedConversationId, (msg) => {
        if (msg.eventType === 'TYPING_INDICATOR') {
          if (msg.senderType === 'user') {
            setIsCustomerTyping(msg.content === 'typing');
          }
        }
      });
    }

    if (selectedConversationId) {
      setShowMobileChat(true);
    }

    return () => chatService.unsubscribeFromConversation();
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
        // Reset unread count immediately if we are already viewing this conversation
        markAsRead(event.conversation.id);
        
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
      if (data.length > 0 && !selectedConversationIdRef.current) {
        setSelectedConversationId(data[0].id);
      }
    } catch (err) {
      setError('Failed to load conversations');
      console.error(err);
    } finally {
      if (!silent) setLoadingConversations(false);
    }
  }

  const markAsRead = async (id) => {
    try {
      await chatService.markAsRead(id);
      // Update local state to show zero unread immediately
      setConversations(prev => prev.map(c => c.id === id ? { ...c, unreadCount: 0 } : c));
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

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

    // Gửi tin nhắn admin qua WebSocket
    // Chúng ta giả định agentId = 1 (Nhân viên)
    chatService.sendWebSocketMessage(
      selectedConversation.id,
      "Nhân viên hỗ trợ",
      "agent",
      newMessage
    );

    // Stop typing indicator
    if (adminTypingTimeoutRef.current) clearTimeout(adminTypingTimeoutRef.current);
    chatService.sendTypingIndicator(selectedConversation.id, "Nhân viên hỗ trợ", "agent", false);
    lastAdminTypingSentRef.current = 0;

    setNewMessage('');
  };

  const handleAdminInputChange = (e) => {
    const value = e.target.value;
    setNewMessage(value);

    if (selectedConversationId && chatService.isConnected()) {
      const now = Date.now();
      if (now - lastAdminTypingSentRef.current > 3000) {
        chatService.sendTypingIndicator(selectedConversationId, "Nhân viên hỗ trợ", "agent", true);
        lastAdminTypingSentRef.current = now;
      }

      if (adminTypingTimeoutRef.current) clearTimeout(adminTypingTimeoutRef.current);
      adminTypingTimeoutRef.current = setTimeout(() => {
        chatService.sendTypingIndicator(selectedConversationId, "Nhân viên hỗ trợ", "agent", false);
        lastAdminTypingSentRef.current = 0;
      }, 3000);
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header riêng cho Admin */}
      <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center gap-3">
            {/* Mobile Back Button */}
            {showMobileChat && (
              <button 
                onClick={() => setShowMobileChat(false)}
                className="lg:hidden flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-400 transition hover:bg-white/10"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <div>
              <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] text-cyan-300/80">SmartAgent Admin</p>
              <h1 className="text-base sm:text-xl font-semibold text-white truncate max-w-[150px] sm:max-w-none">Hybrid Console</h1>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-6">
            <Link 
              to="/admin/settings"
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              <span>⚙️</span> <span className="hidden sm:inline">Cấu hình Bot</span>
            </Link>
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              <span className="hidden sm:inline text-sm font-medium text-emerald-400">Hệ thống sẵn sàng</span>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-[1600px] grid-cols-1 gap-4 p-4 lg:grid-cols-[340px_1fr] lg:px-6 overflow-hidden" style={{ height: 'calc(100vh - 65px)' }}>
        
        {/* CỘT 1: SMART INBOX */}
        <aside className={`${showMobileChat ? 'hidden lg:flex' : 'flex'} flex-col overflow-hidden rounded-3xl border border-white/10 bg-slate-900/80 shadow-2xl shadow-cyan-950/20 backdrop-blur-xl`}>
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

            {/* DEMO SEARCH BAR */}
            <div className="px-5 mb-4">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm tên hoặc mã khách..."
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-9 pr-4 text-xs text-white placeholder-slate-500 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                />
                <svg className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
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
                Nhân viên hỗ trợ
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
            
            {/* Channel Filter Bar */}
            <div className="flex items-center gap-2 px-5 py-3 border-b border-white/5 bg-white/[0.02]">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mr-1">Lọc theo:</span>
              <button 
                onClick={() => setChannelFilter('all')}
                className={`px-2 py-1 rounded-md text-[10px] font-bold transition ${channelFilter === 'all' ? 'bg-cyan-500/20 text-cyan-300 ring-1 ring-cyan-500/50' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Tất cả
              </button>
              <button 
                onClick={() => setChannelFilter('web')}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold transition ${channelFilter === 'web' ? 'bg-cyan-500/20 text-cyan-300 ring-1 ring-cyan-500/50' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <span>🌐</span> Web
              </button>
              <button 
                onClick={() => setChannelFilter('facebook')}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold transition ${channelFilter === 'facebook' ? 'bg-cyan-500/20 text-cyan-300 ring-1 ring-cyan-500/50' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <span>💬</span> FB
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
                    <p>Không có khách cần Manual!</p>
                  </>
                ) : 'Chưa có hội thoại nào.'}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredConversations.map((conversation) => {
                  const isSelected = conversation.id === selectedConversationId;
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
                          <span className="text-sm font-bold text-white">
                            {conversation.customerName || `Khách hàng #${conversation.customerId} (${conversation.channel || 'Web'})`}
                          </span>
                          <div className="mt-1 flex items-center gap-2">
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${botActive ? 'bg-blue-500/20 text-blue-300' : 'bg-rose-500/20 text-rose-300 border border-rose-500/50 animate-pulse'}`}>
                              {botActive ? '🤖 Bot Auto' : '👩‍💼 Manual'}
                            </span>
                          </div>
                        </div>
                        
                        {/* BADGE HIỂN THỊ: LEAD SCORE HOẶC UNREAD COUNT */}
                        <div className="flex flex-col items-end">
                          {botActive ? (
                            <div className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black ${
                              conversation.leadScore >= 50 
                                ? 'bg-orange-500 text-white shadow-[0_0_12px_rgba(249,115,22,0.5)] animate-pulse' 
                                : 'bg-slate-700 text-slate-400'
                            }`}>
                              <span>🔥</span>
                              {conversation.leadScore || 0}
                            </div>
                          ) : (
                            conversation.unreadCount > 0 && (
                              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500 text-[10px] font-black text-slate-900 shadow-[0_0_12px_rgba(6,182,212,0.5)] animate-bounce">
                                {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                              </div>
                            )
                          )}
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
        <section className={`${showMobileChat ? 'flex' : 'hidden lg:flex'} flex-col overflow-hidden rounded-3xl border border-white/10 bg-slate-900/80 shadow-2xl shadow-cyan-950/20 backdrop-blur-xl`}>
          <div className="flex items-center justify-between border-b border-white/10 px-4 sm:px-5 py-3 sm:py-4 bg-slate-900/50">
            <div className="overflow-hidden">
              <p className="text-[10px] uppercase tracking-[0.28em] text-cyan-300/80">Workspace</p>
              <h2 className="text-sm sm:text-lg font-semibold text-white truncate">
                {selectedConversation 
                  ? (selectedConversation.customerName || `Khách hàng #${selectedConversation.customerId} (${selectedConversation.channel || 'Web'})`)
                  : 'Chưa chọn hội thoại'}
              </h2>
            </div>
            
            {/* Nút TAKE OVER Khổng lồ */}
            {selectedConversation && selectedConversation.isBotActive !== false && selectedConversation.status !== 'HANDED_OVER' && (
              <button 
                onClick={handleTakeOver}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-white shadow-lg shadow-rose-500/30 transition hover:scale-105 hover:shadow-rose-500/50"
              >
                <span>⚡</span> <span className="hidden sm:inline">TAKE OVER</span><span className="sm:hidden">TAKE</span>
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
                      <div className={`max-w-[90%] sm:max-w-[80%] rounded-2xl px-3 sm:px-4 py-2 sm:py-3 shadow-lg ${
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
                
                {/* Customer typing indicator */}
                {isCustomerTyping && (
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
                  onChange={handleAdminInputChange}
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

      </div>
    </div>
  );
}