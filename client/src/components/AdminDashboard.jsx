import { useEffect, useMemo, useRef, useState } from 'react';
import chatService from '../services/chatService';

function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString();
}

function getStatusClass(status) {
  const normalized = String(status || '').toUpperCase();
  if (normalized === 'ACTIVE') return 'bg-emerald-400/15 text-emerald-300 ring-1 ring-emerald-400/30';
  if (normalized === 'CLOSED') return 'bg-slate-400/15 text-slate-300 ring-1 ring-slate-400/20';
  if (normalized === 'HANDED_OVER') return 'bg-amber-400/15 text-amber-300 ring-1 ring-amber-400/30';
  return 'bg-cyan-400/15 text-cyan-300 ring-1 ring-cyan-400/30';
}

export default function AdminDashboard() {
  const [conversations, setConversations] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState('');
  const selectedConversationIdRef = useRef(null);

  const selectedConversation = useMemo(
    () => conversations.find((item) => item.id === selectedConversationId) || null,
    [conversations, selectedConversationId]
  );

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    selectedConversationIdRef.current = selectedConversationId;

    if (selectedConversationId) {
      loadMessages(selectedConversationId);
    }
  }, [selectedConversationId]);

  useEffect(() => {
    const conversationInterval = setInterval(() => {
      loadConversations(true);
    }, 5000);

    return () => {
      clearInterval(conversationInterval);
    };
  }, []);

  useEffect(() => {
    if (!selectedConversationId) {
      return undefined;
    }

    const messageInterval = setInterval(() => {
      loadMessages(selectedConversationIdRef.current, true);
    }, 2000);

    return () => {
      clearInterval(messageInterval);
    };
  }, [selectedConversationId]);

  async function loadConversations(silent = false) {
    if (!silent) {
      setLoadingConversations(true);
    }
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
      if (!silent) {
        setLoadingConversations(false);
      }
    }
  }

  async function loadMessages(conversationId, silent = false) {
    if (!conversationId) {
      return;
    }

    if (!silent) {
      setLoadingMessages(true);
    }

    try {
      const data = await chatService.getConversationHistory(conversationId);
      setMessages(data);
    } catch (err) {
      console.error(err);
      setMessages([]);
    } finally {
      if (!silent) {
        setLoadingMessages(false);
      }
    }
  }

  return (
    <div className="mx-auto grid min-h-[calc(100vh-73px)] max-w-7xl grid-cols-1 gap-4 px-4 py-4 lg:grid-cols-[360px_1fr] lg:px-6">
      <aside className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/80 shadow-2xl shadow-cyan-950/20 backdrop-blur-xl">
        <div className="border-b border-white/10 px-5 py-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-cyan-300/80">Admin</p>
              <h2 className="text-lg font-semibold text-white">Conversation List</h2>
            </div>
            <button
              type="button"
              onClick={loadConversations}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:bg-white/10"
            >
              Refresh
            </button>
          </div>
          <p className="mt-1 text-sm text-slate-400">Select a conversation to inspect message history.</p>
        </div>

        <div className="max-h-[calc(100vh-200px)] overflow-y-auto p-3">
          {loadingConversations ? (
            <div className="px-4 py-8 text-center text-slate-400">Loading conversations...</div>
          ) : error ? (
            <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </div>
          ) : conversations.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-8 text-center text-slate-400">
              No conversations found.
            </div>
          ) : (
            <div className="space-y-3">
              {conversations.map((conversation) => {
                const isSelected = conversation.id === selectedConversationId;

                return (
                  <button
                    key={conversation.id}
                    type="button"
                    onClick={() => setSelectedConversationId(conversation.id)}
                    className={`w-full rounded-2xl border px-4 py-4 text-left transition ${
                      isSelected
                        ? 'border-cyan-400/40 bg-cyan-400/10 shadow-lg shadow-cyan-950/20'
                        : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.07]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-base font-semibold text-white">Conversation #{conversation.id}</div>
                        <div className="mt-1 text-sm text-slate-400">Customer #{conversation.customerId} • {conversation.channel}</div>
                      </div>
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${getStatusClass(conversation.status)}`}>
                        {conversation.status}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-slate-400">
                      <div>
                        <div className="uppercase tracking-wide text-slate-500">Messages</div>
                        <div className="mt-1 text-sm text-slate-200">{conversation.messageCount ?? 0}</div>
                      </div>
                      <div>
                        <div className="uppercase tracking-wide text-slate-500">Updated</div>
                        <div className="mt-1 text-sm text-slate-200">{formatDate(conversation.updatedAt)}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </aside>

      <section className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/80 shadow-2xl shadow-cyan-950/20 backdrop-blur-xl">
        <div className="border-b border-white/10 px-5 py-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-cyan-300/80">History</p>
              <h2 className="text-lg font-semibold text-white">
                {selectedConversation ? `Conversation #${selectedConversation.id}` : 'Select a conversation'}
              </h2>
            </div>
            {selectedConversation && (
              <div className="flex flex-wrap gap-2 text-xs text-slate-300">
                <span className="rounded-full bg-white/5 px-3 py-1">Customer #{selectedConversation.customerId}</span>
                <span className="rounded-full bg-white/5 px-3 py-1">{selectedConversation.channel}</span>
                <span className={`rounded-full px-3 py-1 ${getStatusClass(selectedConversation.status)}`}>
                  {selectedConversation.status}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="max-h-[calc(100vh-200px)] overflow-y-auto p-5">
          {!selectedConversation ? (
            <div className="flex min-h-[280px] items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/[0.03] text-slate-400">
              Choose a conversation from the left panel.
            </div>
          ) : loadingMessages ? (
            <div className="flex min-h-[280px] items-center justify-center text-slate-400">Loading chat history...</div>
          ) : messages.length === 0 ? (
            <div className="flex min-h-[280px] items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/[0.03] text-slate-400">
              No messages in this conversation yet.
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => {
                const isUser = String(message.senderType || '').toLowerCase() === 'user';

                return (
                  <div key={message.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-2xl rounded-3xl px-4 py-3 ${isUser ? 'bg-cyan-500 text-slate-950' : 'bg-white/10 text-slate-100'} border ${isUser ? 'border-cyan-300/40' : 'border-white/10'}`}>
                      <div className="flex items-center justify-between gap-4 text-xs opacity-80">
                        <span className="font-semibold uppercase tracking-wide">{message.sender || 'Unknown'}</span>
                        <span>{formatDate(message.timestamp)}</span>
                      </div>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6">{message.content}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}