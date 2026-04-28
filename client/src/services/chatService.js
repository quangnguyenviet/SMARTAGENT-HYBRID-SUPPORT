import { Client } from '@stomp/stompjs';

const API_BASE = 'http://localhost:8080/api';
const WS_BROKER_URL = 'ws://localhost:8080/ws';

class ChatService {
  constructor() {
    this.client = null;
    this.listeners = [];
    this.conversationId = null;
    this.subscriptions = {}; // Store multiple subscriptions
  }

  // REST API - Create new conversation
  async createConversation(customerId, channel = 'web') {
    try {
      const res = await fetch(`${API_BASE}/conversations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId, channel }),
      });
      const data = await res.json();
      if (data.success) {
        this.conversationId = data.data.id;
        return data.data;
      }
      throw new Error(data.message);
    } catch (error) {
      console.error('Create conversation failed:', error);
      throw error;
    }
  }

  // REST API - Get conversation history
  async getConversationHistory(conversationId) {
    try {
      const res = await fetch(`${API_BASE}/conversations/${conversationId}/messages`);
      const data = await res.json();
      return data.success ? data.data : [];
    } catch (error) {
      console.error('Get history failed:', error);
      return [];
    }
  }

  // REST API - Get all conversations for admin dashboard
  async getAllConversations() {
    try {
      const res = await fetch(`${API_BASE}/conversations`);
      const data = await res.json();
      return data.success ? data.data : [];
    } catch (error) {
      console.error('Get all conversations failed:', error);
      return [];
    }
  }

  // REST API - Send message via HTTP (optional, WebSocket is primary)
  async sendMessage(conversationId, sender, senderType, content) {
    try {
      const res = await fetch(`${API_BASE}/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender, senderType, content }),
      });
      const data = await res.json();
      return data.success ? data.data : null;
    } catch (error) {
      console.error('Send message failed:', error);
      throw error;
    }
  }

  // REST API - Take over conversation
  async takeOver(conversationId, agentId) {
    try {
      const res = await fetch(`${API_BASE}/conversations/${conversationId}/takeover`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId }),
      });
      const data = await res.json();
      return data.success;
    } catch (error) {
      console.error('Take over failed:', error);
      return false;
    }
  }

  // REST API - Mark conversation as read
  async markAsRead(conversationId) {
    try {
      const res = await fetch(`${API_BASE}/conversations/${conversationId}/read`, {
        method: 'POST'
      });
      const data = await res.json();
      return data.success;
    } catch (error) {
      console.error('Mark as read failed:', error);
      return false;
    }
  }

  // REST API - Get Bot Settings
  async getBotSettings() {
    try {
      const res = await fetch(`${API_BASE}/settings/bot`);
      const data = await res.json();
      return data.success ? data.data : null;
    } catch (error) {
      console.error('Get bot settings failed:', error);
      return null;
    }
  }

  // REST API - Update Bot Settings
  async updateBotSettings(settings) {
    try {
      const res = await fetch(`${API_BASE}/settings/bot`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      return data.success;
    } catch (error) {
      console.error('Update bot settings failed:', error);
      return false;
    }
  }

  // STOMP WebSocket - Connect for Customer
  connectWebSocket(conversationId) {
    return this._connect(() => {
      this.subscribeToTopic(`/topic/chat/${conversationId}`, (message) => {
        if (message.body) {
          const parsedMessage = JSON.parse(message.body);
          if (!parsedMessage.eventType) {
            parsedMessage.eventType = 'new_message';
          }
          this.notifyListeners(parsedMessage);
        }
      }, 'customer_chat');
    });
  }

  // STOMP WebSocket - Connect for Admin
  connectAdminWebSocket(onAdminEvent) {
    return this._connect(() => {
      this.subscribeToTopic('/topic/admin/conversations', (message) => {
        if (message.body) {
          const event = JSON.parse(message.body);
          onAdminEvent(event);
        }
      }, 'admin_global');
    });
  }

  // Admin: subscribe to a specific conversation for typing/updates
  subscribeToConversation(conversationId, onMessage) {
    this.subscribeToTopic(`/topic/chat/${conversationId}`, (message) => {
      if (message.body) {
        const parsedMessage = JSON.parse(message.body);
        onMessage(parsedMessage);
      }
    }, 'conversation_detail');
  }

  unsubscribeFromConversation() {
    if (this.subscriptions['conversation_detail']) {
      this.subscriptions['conversation_detail'].unsubscribe();
      delete this.subscriptions['conversation_detail'];
    }
  }

  // Generic subscribe method
  subscribeToTopic(topic, callback, key) {
    if (this.client && this.client.connected) {
      // Unsubscribe existing if same key
      if (this.subscriptions[key]) {
        this.subscriptions[key].unsubscribe();
      }
      this.subscriptions[key] = this.client.subscribe(topic, callback);
    }
  }

  // Internal common connect logic
  _connect(onConnectCallback) {
    return new Promise((resolve, reject) => {
      if (this.client && this.client.connected) {
        if (onConnectCallback) onConnectCallback();
        return resolve();
      }

      this.client = new Client({
        brokerURL: WS_BROKER_URL,
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        onConnect: () => {
          console.log('STOMP connected');
          this.notifyListeners({ eventType: 'connection_established' });
          if (onConnectCallback) onConnectCallback();
          resolve();
        },
        onStompError: (frame) => {
          console.error('Broker reported error: ' + frame.headers['message']);
          reject(new Error(frame.headers['message']));
        },
      });

      this.client.activate();
    });
  }

  // STOMP WebSocket - Send message
  sendWebSocketMessage(conversationId, sender, senderType, content) {
    if (this.client && this.client.connected) {
      const eventType = senderType === 'agent' ? 'AGENT_MESSAGE' : 'USER_MESSAGE';
      this.client.publish({
        destination: '/app/chat.sendMessage',
        body: JSON.stringify({
          eventType,
          conversationId,
          sender,
          senderType,
          content,
        })
      });
    } else {
      console.warn('STOMP client not connected');
    }
  }

  sendTypingIndicator(conversationId, sender, senderType, isTyping) {
    if (this.client && this.client.connected) {
      this.client.publish({
        destination: '/app/chat.sendMessage',
        body: JSON.stringify({
          eventType: 'TYPING_INDICATOR',
          conversationId,
          sender,
          senderType,
          content: isTyping ? 'typing' : 'stopped',
        })
      });
    }
  }

  isConnected() {
    return this.client && this.client.connected;
  }

  onMessage(callback) {
    this.listeners.push(callback);
  }

  clearListeners() {
    this.listeners = [];
  }

  notifyListeners(message) {
    this.listeners.forEach(listener => listener(message));
  }

  disconnect() {
    Object.keys(this.subscriptions).forEach(key => {
      this.subscriptions[key].unsubscribe();
    });
    this.subscriptions = {};
    
    if (this.client) {
      this.client.deactivate();
      this.client = null;
    }
  }
}

export default new ChatService();
