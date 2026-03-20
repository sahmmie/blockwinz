
# 🧩 WebSocket API Documentation: `chat` Namespace

This gateway enables real-time chat functionality in the application. All events are under the `chat` namespace.

---

## 🔐 Authentication

All events require WebSocket authentication using the `WsAuthGuard`. A valid JWT must be passed during the WebSocket handshake using the `auth` object:

```ts
const socket = io('wss://your-server.com/chat', {
  auth: {
    token: 'JWT_TOKEN_HERE'
  }
});
```

---

## 🎯 Events

### 📥 `joinRoom`

- **Direction**: Client → Server
- **Description**: Joins a user to the specified chat room. If the user is not already a member, they are added.
- **Payload**:
  ```ts
  {
    room: string; // The name of the room to join
  }
  ```
- **Returns**: `RoomInfo`  
- **Broadcasts**: Emits `roomInfo` back to the client.

---

### 📤 `roomInfo`

- **Direction**: Server → Client
- **Description**: Sent when a user joins a room or when room info is updated.
- **Payload**:
  ```ts
  {
    _id: string;
    name: string;
    isPrivate: boolean;
    isActive: boolean;
    membersCount: number;
    onlineMembersCount: number;
    canSend?: boolean;
    isViewer?: boolean;
  }
  ```

---

### 📥 `getRoomInfo`

- **Direction**: Client → Server
- **Description**: Retrieves metadata for a specific room.
- **Payload**:
  ```ts
  {
    room: string; // Room name
  }
  ```
- **Returns**: `RoomInfo`

---

### 📥 `getRoomPreviousMessages`

- **Direction**: Client → Server
- **Description**: Fetches previous messages in a room using pagination. The user must be a member of the room.
- **Payload**:
  ```ts
  {
    room: string;
    query: {
      page: number;  // Page number (1-based)
      limit: number; // Number of messages per page
    }
  }
  ```
- **Returns**: `MessageResponseDto[]` (List of message objects)

---

### 📥 `getUserRooms`

- **Direction**: Client → Server
- **Description**: Fetches all rooms the current user is a member of.
- **Payload**: `None`
- **Returns**: `RoomInfo[]`

---

### 📥 `sendMessage`

- **Direction**: Client → Server
- **Description**: Sends a message to a specific room. The sender must be a member of the room and allowed to send messages.
- **Payload**:
  ```ts
  {
    room: string; // Room name
    content: string; // Message text
    type: 'text' | 'image' | 'system'; // Type of message
  }
  ```
- **Returns**: `MessageResponseDto`
- **Broadcasts**: `newMessage` to all room members except the sender.

---

### 📤 `newMessage`

- **Direction**: Server → Client
- **Description**: Sent to all room members (except the sender) when a new message is posted.
- **Payload**:
  ```ts
  {
    _id: string;
    room: string;
    content: string;
    sender: {
      _id: string;
      username: string;
    };
    createdAt: string;
    type: 'text' | 'image' | 'system';
  }
  ```

---

### ❌ `error`

- **Direction**: Server → Client
- **Description**: Sent when any operation fails (e.g., unauthorized access, bad input, not a room member, etc.)
- **Payload**:
  ```ts
  {
    message: string;
  }
  ```

---

## 📘 Types

### `RoomInfo`
```ts
{
  _id: string;
  name: string;
  isPrivate: boolean;
  isActive: boolean;
  membersCount: number;
  onlineMembersCount: number;
  canSend?: boolean;
  isViewer?: boolean;
}
```

### `SendMessageDto`
```ts
{
  room: string;
  content: string;
  type: 'text' | 'image' | 'system';
}
```

### `MessageResponseDto`
```ts
{
  _id: string;
  room: string;
  content: string;
  sender: {
    _id: string;
    username: string;
  };
  createdAt: string;
  type: 'text' | 'image' | 'system';
}
```
