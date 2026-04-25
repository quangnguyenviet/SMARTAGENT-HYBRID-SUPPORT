const API_BASE = 'http://localhost:8080/api';
const WS_URL = 'ws://localhost:8080/ws/chat';

class ChatService {
  constructor() {
    this.ws = null;
    this.listeners = [];
    this.conversationId = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
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

  // WebSocket - Connect and listen
  connectWebSocket(conversationId) {
    return new Promise((resolve, reject) => {
      try {
        const socket = new WebSocket(WS_URL);
        this.ws = socket;

        socket.onopen = () => {
          console.log('WebSocket connected');
          this.reconnectAttempts = 0;
          resolve();
        };

        socket.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            console.log('Received:', message);
            this.notifyListeners(message);
          } catch (error) {
            console.error('Failed to parse message:', error);
          }
        };

        socket.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };

        socket.onclose = () => {
          console.log('WebSocket closed');
          if (this.ws === socket) {
            this.ws = null;
          }
          this.attemptReconnect(conversationId);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  // Attempt to reconnect WebSocket
  attemptReconnect(conversationId) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000);
      console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})...`);
      setTimeout(() => this.connectWebSocket(conversationId), delay);
    }
  }

  // WebSocket - Send message
  sendWebSocketMessage(conversationId, sender, senderType, content) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        eventType: 'user_message',
        conversationId,
        sender,
        senderType,
        content,
      }));
    } else {
      console.warn('WebSocket not connected');
    }
  }

  // Check whether socket is ready for interaction
  isConnected() {
    return this.ws && this.ws.readyState === WebSocket.OPEN;
  }

  // Register listener for WebSocket messages
  onMessage(callback) {
    this.listeners.push(callback);
  }

  // Remove all registered listeners
  clearListeners() {
    this.listeners = [];
  }

  // Notify all listeners
  notifyListeners(message) {
    this.listeners.forEach(listener => listener(message));
  }

  // Disconnect WebSocket
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export default new ChatService();
