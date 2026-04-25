import { useState, useEffect, useRef } from 'react';
import chatService from '../services/chatService';

export default function ChatWindow() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [conversationId, setConversationId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [customerId, setCustomerId] = useState(1); // Mock customer ID
  const messagesEndRef = useRef(null);
  const initialized = useRef(false);

  // Initialize chat on mount
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      initializeChat();
    }
    return () => {
      chatService.disconnect();
    };
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Listen for incoming WebSocket messages
  useEffect(() => {
    chatService.onMessage((message) => {
      const eventType = String(message.eventType || '').toLowerCase();

      if (eventType === 'connection_established') {
        setConnected(true);
        console.log('Chat connected');
      } else if (eventType === 'new_message' || eventType === 'user_message' || eventType === 'bot_response') {
        const newMessage = {
          id: message.id || Date.now(),
          sender: message.sender,
          senderType: message.senderType,
          content: message.content,
          timestamp: message.timestamp ? new Date(message.timestamp).toLocaleTimeString() : new Date().toLocaleTimeString(),
        };

        setMessages(prev => {
          // Prevent duplicates if optimistic rendering was used or message loops back
          if (prev.some(m => m.id === newMessage.id)) return prev;
          return [...prev, newMessage];
        });
      }
    });

    return () => {
      chatService.clearListeners();
    };
  }, []);

  // Create conversation and connect WebSocket
  async function initializeChat() {
    try {
      setLoading(true);
      // Create new conversation
      const conversation = await chatService.createConversation(customerId, 'web');
      setConversationId(conversation.id);

      // Load conversation history
      const history = await chatService.getConversationHistory(conversation.id);
      const formattedHistory = history.map(msg => ({
        id: msg.id,
        sender: msg.sender,
        senderType: msg.senderType,
        content: msg.content,
        timestamp: new Date(msg.timestamp).toLocaleTimeString(),
      }));
      setMessages(formattedHistory);

      // Connect WebSocket
      await chatService.connectWebSocket(conversation.id);
    } catch (error) {
      console.error('Failed to initialize chat:', error);
      alert('Failed to connect to chat server. Make sure backend is running on http://localhost:8080');
    } finally {
      setLoading(false);
    }
  }

  // Send message
  function handleSendMessage(e) {
    e.preventDefault();
    if (!inputValue.trim() || !conversationId || !chatService.isConnected()) return;

    const message = {
      id: Date.now(),
      sender: 'Customer',
      senderType: 'user',
      content: inputValue,
      timestamp: new Date().toLocaleTimeString(),
    };

    // Removed optimistic rendering - we will rely on STOMP pub-sub returning the message back to us instantly

    // Send via WebSocket STOMP
    chatService.sendWebSocketMessage(
      conversationId,
      'Customer',
      'user',
      inputValue
    );

    setInputValue('');
  }

  if (loading) {
    return (
      <div className="mx-auto flex min-h-[calc(100vh-73px)] max-w-5xl items-center justify-center px-4 py-6">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/80 p-8 text-center shadow-2xl shadow-cyan-950/20 backdrop-blur-xl">
          <div className="mx-auto mb-4 h-10 w-10 animate-pulse rounded-full bg-cyan-400/40" />
          <div className="text-2xl font-semibold tracking-tight text-white">Connecting...</div>
          <div className="mt-2 text-sm text-slate-400">Initializing your customer session</div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-73px)] w-full max-w-5xl flex-col gap-4 px-4 py-4 lg:px-6">
      <section className="rounded-3xl border border-white/10 bg-slate-900/80 p-4 shadow-2xl shadow-cyan-950/20 backdrop-blur-xl sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.26em] text-cyan-300/80">Customer View</p>
            <h2 className="mt-1 text-xl font-semibold text-white">Live Conversation</h2>
            <p className="mt-1 text-sm text-slate-400">Conversation #{conversationId} • Customer #{customerId}</p>
          </div>
          <div className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${connected ? 'bg-emerald-400/15 text-emerald-300 ring-1 ring-emerald-400/30' : 'bg-rose-400/15 text-rose-300 ring-1 ring-rose-400/30'}`}>
            <span className={`inline-block h-2 w-2 rounded-full ${connected ? 'bg-emerald-300' : 'bg-rose-300'}`} />
            {connected ? 'Connected' : 'Disconnected'}
          </div>
        </div>
      </section>

      <section className="flex min-h-[420px] flex-1 flex-col overflow-hidden rounded-3xl border border-white/10 bg-slate-900/80 shadow-2xl shadow-cyan-950/20 backdrop-blur-xl">
        <div className="border-b border-white/10 px-5 py-3">
          <div className="text-sm font-medium text-slate-200">Message History</div>
          <div className="text-xs text-slate-400">Latest messages appear automatically</div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-5">
          {messages.length === 0 ? (
            <div className="flex min-h-[260px] items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.03] text-slate-400">
              Start by sending your first message.
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => {
                const isUser = String(msg.senderType || '').toLowerCase() === 'user';
                const isAgent = String(msg.senderType || '').toLowerCase() === 'agent';
                const isBot = String(msg.senderType || '').toLowerCase() === 'bot';

                return (
                  <div
                    key={msg.id}
                    className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`w-full max-w-[85%] rounded-3xl border px-4 py-3 sm:max-w-[75%] shadow-lg ${
                        isUser
                          ? 'border-cyan-300/40 bg-cyan-500 text-slate-950 rounded-tr-none'
                          : isAgent
                            ? 'border-indigo-500/50 bg-indigo-600 text-white rounded-tl-none shadow-indigo-500/20'
                            : 'border-white/10 bg-white/10 text-slate-100 rounded-tl-none'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4 text-[10px] uppercase tracking-wider opacity-80">
                        <span className={`font-bold ${isAgent ? 'text-indigo-200' : isBot ? 'text-cyan-300' : ''}`}>
                          {isAgent ? '👩‍💼 Nhân viên hỗ trợ' : isBot ? '🤖 AI Assistant' : msg.sender || 'Customer'}
                        </span>
                        <span>{msg.timestamp}</span>
                      </div>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6">{msg.content}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <div className="border-t border-white/10 bg-slate-900/70 px-4 py-4 sm:px-5">
          <form onSubmit={handleSendMessage} className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={connected ? 'Type your message here...' : 'Waiting for connection...'}
                disabled={!connected}
                className="flex-1 rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-400 focus:border-cyan-300/40 focus:ring-2 focus:ring-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!connected || !inputValue.trim()}
                className="rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-300"
              >
                Send
              </button>
            </div>

            {!connected && (
              <div className="text-xs text-rose-300">
                Connection lost. Ensure backend is running on port 8080.
              </div>
            )}
          </form>
        </div>
      </section>
    </div>
  );
}
