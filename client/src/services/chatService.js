import { Client } from '@stomp/stompjs';

const API_BASE = 'http://localhost:8080/api';
const WS_BROKER_URL = 'ws://localhost:8080/ws';

class ChatService {
  constructor() {
    this.client = null;
    this.listeners = [];
    this.conversationId = null;
    this.subscription = null;
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

  // STOMP WebSocket - Connect and listen
  connectWebSocket(conversationId) {
    return new Promise((resolve, reject) => {
      this.conversationId = conversationId;
      
      this.client = new Client({
        brokerURL: WS_BROKER_URL,
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        onConnect: () => {
          console.log('STOMP connected');
          
          // Emit internal event for UI to know it's connected
          this.notifyListeners({ eventType: 'connection_established' });
          
          // Subscribe to the specific room
          this.subscription = this.client.subscribe(`/topic/chat/${conversationId}`, (message) => {
            if (message.body) {
              const parsedMessage = JSON.parse(message.body);
              // Backend MessageDTO -> Add eventType so ChatWindow handles it
              parsedMessage.eventType = 'new_message';
              this.notifyListeners(parsedMessage);
            }
          });
          resolve();
        },
        onStompError: (frame) => {
          console.error('Broker reported error: ' + frame.headers['message']);
          console.error('Additional details: ' + frame.body);
          reject(new Error(frame.headers['message']));
        },
        onWebSocketClose: () => {
          console.log('STOMP connection closed');
        }
      });

      this.client.activate();
    });
  }

  // STOMP WebSocket - Send message
  sendWebSocketMessage(conversationId, sender, senderType, content) {
    if (this.client && this.client.connected) {
      this.client.publish({
        destination: '/app/chat.sendMessage',
        body: JSON.stringify({
          eventType: 'USER_MESSAGE',
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
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
    if (this.client) {
      this.client.deactivate();
      this.client = null;
    }
  }
}

export default new ChatService();
