# API Documentation Template - Markdown

Use this template as a starting point for generating API documentation in Markdown format.

```markdown
# API Documentation - SmartAgent Hybrid Support

**Base URL**: `http://localhost:8080`  
**Version**: 1.0.0  
**Last Updated**: YYYY-MM-DD

## Table of Contents
- [Overview](#overview)
- [Authentication](#authentication)
- [Chat Module](#chat-module)
- [Orchestrator Module](#orchestrator-module)
- [Security Module](#security-module)
- [Common Response Formats](#common-response-formats)
- [Error Codes](#error-codes)
- [Examples & Workflows](#examples--workflows)

## Overview

SmartAgent API provides endpoints for managing conversations, messages, AI orchestration, and user authentication in a hybrid bot-to-human support system.

### Key Features
- Real-time chat via WebSocket
- AI-powered message scoring & handover
- Role-based access control
- Session-based conversation management

### Base URL
```
http://localhost:8080/api
```

### Common Headers
```
Content-Type: application/json
Authorization: Bearer <jwt_token>  # For authenticated endpoints
```

## Authentication

All endpoints (except `/auth/login`) require JWT token in header:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Get Token
```bash
POST /auth/login
Content-Type: application/json

{
  "username": "user@example.com",
  "password": "password123"
}
```

---

## Chat Module

### POST /conversations
Create a new conversation

**Request**:
```json
{
  "customerId": 123,
  "channel": "zalo"
}
```

**Response (201 Created)**:
```json
{
  "success": true,
  "message": "Conversation created successfully",
  "data": {
    "id": 1,
    "customerId": 123,
    "channel": "zalo",
    "status": "ACTIVE",
    "createdAt": "2026-04-25T10:30:00Z",
    "updatedAt": "2026-04-25T10:30:00Z",
    "lastMessageTime": null,
    "messageCount": 0
  },
  "timestamp": 1640000000000
}
```

**Errors**:
- `500`: Failed to create conversation

**cURL Example**:
```bash
curl -X POST http://localhost:8080/api/conversations \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": 123,
    "channel": "zalo"
  }'
```

---

### GET /conversations/{id}
Get a specific conversation

**Path Parameters**:
- `id` (Long) - Conversation ID

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "id": 1,
    "customerId": 123,
    "channel": "zalo",
    "status": "ACTIVE",
    "createdAt": "2026-04-25T10:30:00Z",
    "updatedAt": "2026-04-25T10:45:00Z",
    "lastMessageTime": "2026-04-25T10:45:00Z",
    "messageCount": 5
  },
  "timestamp": 1640000000000
}
```

**Errors**:
- `404`: Conversation not found
- `500`: Server error

---

### GET /conversations/customer/{customerId}
Get all conversations for a customer

**Path Parameters**:
- `customerId` (Long) - Customer ID

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Found 3 conversations",
  "data": [
    {
      "id": 1,
      "customerId": 123,
      "channel": "zalo",
      "status": "ACTIVE",
      "messageCount": 5
    },
    {
      "id": 2,
      "customerId": 123,
      "channel": "facebook",
      "status": "CLOSED",
      "messageCount": 12
    }
  ],
  "timestamp": 1640000000000
}
```

---

### GET /conversations/{id}/messages
Get all messages in a conversation

**Path Parameters**:
- `id` (Long) - Conversation ID

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Found 5 messages",
  "data": [
    {
      "id": 1,
      "conversationId": 1,
      "sender": "customer_123",
      "senderType": "USER",
      "content": "Hello, I want to buy a product",
      "timestamp": "2026-04-25T10:35:00Z"
    },
    {
      "id": 2,
      "conversationId": 1,
      "sender": "bot",
      "senderType": "BOT",
      "content": "Hi! Welcome to our store. How can I help you?",
      "timestamp": "2026-04-25T10:35:05Z"
    }
  ],
  "timestamp": 1640000000000
}
```

---

### GET /conversations/{id}/messages/recent
Get recent N messages

**Path Parameters**:
- `id` (Long) - Conversation ID

**Query Parameters**:
- `limit` (int, default=10) - Number of recent messages to fetch

**Response (200 OK)**: Same as above

---

### POST /conversations/{id}/messages
Send a message (REST alternative to WebSocket)

**Path Parameters**:
- `id` (Long) - Conversation ID

**Request Body**:
```json
{
  "sender": "customer_123",
  "senderType": "USER",
  "content": "I'm interested in your premium plan"
}
```

**Response (201 Created)**:
```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "id": 3,
    "conversationId": 1,
    "sender": "customer_123",
    "senderType": "USER",
    "content": "I'm interested in your premium plan",
    "timestamp": "2026-04-25T10:36:00Z"
  },
  "timestamp": 1640000000000
}
```

---

### PATCH /conversations/{id}/status
Update conversation status

**Path Parameters**:
- `id` (Long) - Conversation ID

**Query Parameters**:
- `status` (string) - New status (ACTIVE, HANDED_OVER, CLOSED, ARCHIVED)

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Conversation status updated successfully",
  "data": null,
  "timestamp": 1640000000000
}
```

---

### PUT /conversations/{id}/close
Close a conversation

**Path Parameters**:
- `id` (Long) - Conversation ID

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Conversation closed successfully",
  "data": null,
  "timestamp": 1640000000000
}
```

---

### DELETE /conversations/{id}
Delete a conversation

**Path Parameters**:
- `id` (Long) - Conversation ID

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Conversation deleted successfully",
  "data": null,
  "timestamp": 1640000000000
}
```

**Errors**:
- `404`: Conversation not found
- `500`: Server error

---

## WebSocket API

### Endpoint
```
ws://localhost:8080/ws/chat
```

### Event Types
- `user_message` - User sends message
- `bot_response` - Bot sends response
- `agent_response` - Agent sends message
- `handover_notification` - Handover event
- `typing_indicator` - Typing indicator
- `message_ack` - Message acknowledgement
- `error` - Error message
- `connection_established` - Connection confirmation
- `conversation_closed` - Conversation closed

### Message Format
```json
{
  "eventType": "user_message",
  "conversationId": 1,
  "sender": "customer_123",
  "senderType": "USER",
  "content": "Hello, I need help",
  "metadata": {}
}
```

---

## Common Response Formats

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* actual data */ },
  "timestamp": 1640000000000
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "data": null,
  "timestamp": 1640000000000
}
```

---

## Error Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | OK | Request successful |
| 201 | Created | Resource created |
| 400 | Bad Request | Invalid parameters |
| 401 | Unauthorized | Missing/invalid JWT |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 500 | Internal Server Error | Server error |

---

## DTOs Reference

### ConversationDTO
```json
{
  "id": 1,
  "customerId": 123,
  "channel": "zalo",
  "status": "ACTIVE",
  "createdAt": "2026-04-25T10:30:00Z",
  "updatedAt": "2026-04-25T10:45:00Z",
  "lastMessageTime": "2026-04-25T10:45:00Z",
  "messageCount": 5
}
```

### MessageDTO
```json
{
  "id": 1,
  "conversationId": 1,
  "sender": "customer_123",
  "senderType": "USER",
  "content": "Hello",
  "timestamp": "2026-04-25T10:35:00Z"
}
```

### CreateConversationRequest
```json
{
  "customerId": 123,
  "channel": "zalo"
}
```

### SendMessageRequest
```json
{
  "sender": "customer_123",
  "senderType": "USER",
  "content": "Hi there"
}
```

---

## Examples & Workflows

### Workflow: Create Conversation & Send Message

1. **Create Conversation**
```bash
POST /api/conversations
{
  "customerId": 123,
  "channel": "zalo"
}
→ Response: conversationId = 1
```

2. **Send Message (REST)**
```bash
POST /api/conversations/1/messages
{
  "sender": "customer_123",
  "senderType": "USER",
  "content": "Hello"
}
→ Response: messageId = 1, status = 201
```

3. **Get Message History**
```bash
GET /api/conversations/1/messages
→ Response: List of all messages
```

4. **Close Conversation**
```bash
PUT /api/conversations/1/close
→ Response: status = 200
```

---

## Notes
- All timestamps are in ISO 8601 format (UTC)
- Token expiration: 24 hours
- Rate limit: 100 requests/minute
- Pagination: Default limit=10, max=100
```
