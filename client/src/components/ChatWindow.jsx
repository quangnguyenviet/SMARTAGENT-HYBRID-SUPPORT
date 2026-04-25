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

  // Initialize chat on mount
  useEffect(() => {
    initializeChat();
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
      } else if (eventType === 'user_message' || eventType === 'bot_response' || eventType === 'message_ack') {
        const newMessage = {
          id: Date.now(),
          sender: message.sender,
          senderType: message.senderType,
          content: message.content,
          timestamp: new Date().toLocaleTimeString(),
        };

        if (eventType !== 'message_ack') {
          setMessages(prev => [...prev, newMessage]);
        }
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

    // Add to local UI immediately for optimistic rendering
    setMessages(prev => [...prev, message]);

    // Send via WebSocket
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
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="mb-4 text-2xl font-bold text-purple-600">SmartAgent</div>
          <div className="text-gray-600">Connecting to chat server...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold">SmartAgent Chat</h1>
          <div className="text-sm mt-1 flex items-center gap-2">
            <span className={`inline-block w-2 h-2 rounded-full ${connected ? 'bg-green-300' : 'bg-red-300'}`}></span>
            {connected ? 'Connected' : 'Disconnected'} | Conversation #{conversationId}
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 max-w-4xl mx-auto w-full">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <div className="text-4xl mb-4">💬</div>
              <p>No messages yet. Start the conversation!</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.senderType === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-md px-4 py-2 rounded-lg ${
                    msg.senderType === 'user'
                      ? 'bg-purple-600 text-white rounded-br-none'
                      : 'bg-gray-200 text-gray-900 rounded-bl-none'
                  }`}
                >
                  <div className="text-sm font-semibold">{msg.sender}</div>
                  <div className="mt-1 text-sm">{msg.content}</div>
                  <div className={`text-xs mt-1 ${msg.senderType === 'user' ? 'text-purple-200' : 'text-gray-500'}`}>
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Form */}
      <div className="bg-white border-t border-gray-200 p-4 shadow-lg">
        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={connected ? 'Type a message...' : 'Waiting for connection...'}
              disabled={!connected}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={!connected || !inputValue.trim()}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Send
            </button>
          </div>
          {!connected && (
            <div className="text-sm text-red-600 mt-2">
              ⚠️ Not connected to server. Make sure Spring Backend is running on port 8080
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
