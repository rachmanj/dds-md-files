# DDS Portal Socket.IO Server

Real-time WebSocket server for DDS Portal notifications and live features.

## Setup Instructions

### 1. Install Dependencies

```bash
cd socket-server
npm install
```

### 2. Environment Configuration

```bash
# Copy the example config
cp config.example .env

# Edit .env with your database credentials (same as Laravel)
# Make sure SOCKET_PORT is different from Laravel (recommended: 3002)
```

### 3. Start the Server

#### Development Mode (with auto-restart)

```bash
npm run dev
```

#### Production Mode

```bash
npm start
```

## Server Features

- **Real-time Authentication**: Users authenticate with their user ID
- **Personal Channels**: Each user gets their own notification channel
- **Database Integration**: Stores sessions and notifications in MySQL
- **Auto-cleanup**: Removes inactive sessions every 5 minutes
- **Connection Tracking**: Tracks online/offline status
- **Notification Broadcasting**: Send real-time notifications between users

## API Events

### Client → Server

- `authenticate`: Authenticate user with `{ userId: number }`
- `ping`: Keep connection alive
- `send_notification`: Send notification to another user
- `broadcast`: Broadcast message to all connected users

### Server → Client

- `authenticated`: Confirms successful authentication
- `auth_error`: Authentication failed
- `pong`: Response to ping
- `new_notification`: Incoming notification
- `user_online`: User came online
- `user_offline`: User went offline
- `broadcast_message`: Broadcast from another user

## Port Configuration

- Default Port: `3002`
- Make sure this port is different from:
  - Laravel backend (3001)
  - Next.js frontend (3000)

## Troubleshooting

1. **Can't connect to database**: Check your database credentials in `.env`
2. **Port already in use**: Change `SOCKET_PORT` in `.env`
3. **CORS errors**: Frontend origins are configured in `server.js`
4. **Connection issues**: Check that the port is not blocked by firewall

## Integration with Frontend

The frontend WebSocket service should connect to:

```
http://localhost:3002
```

Make sure to update the frontend WebSocket connection URL if you change the port.
