const { Server } = require("socket.io");
const cors = require("cors");
const mysql = require("mysql2/promise");
const path = require("path");

// Load environment variables
require("dotenv").config({ path: path.join(__dirname, ".env") });

// Debug: Log environment variables
console.log("Environment variables loaded:");
console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_USERNAME:", process.env.DB_USERNAME);
console.log("DB_PASSWORD:", process.env.DB_PASSWORD ? "***" : "undefined");
console.log("DB_DATABASE:", process.env.DB_DATABASE);

// Configuration
const PORT = process.env.SOCKET_PORT || 3002;
const CORS_ORIGINS = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3001",
];

// Database connection
const dbConfig = {
  host: process.env.DB_HOST || "127.0.0.1",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USERNAME || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_DATABASE || "dds_be",
  timezone: "+00:00",
};

let db;

async function connectToDatabase() {
  try {
    db = await mysql.createConnection(dbConfig);
    console.log("✅ Connected to MySQL database");
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    process.exit(1);
  }
}

// Initialize Socket.IO server
const io = new Server(PORT, {
  cors: {
    origin: CORS_ORIGINS,
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

// Active users tracking
const activeUsers = new Map();

// Socket.IO event handlers
io.on("connection", (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);

  // Handle user authentication and join
  socket.on("authenticate", async (data) => {
    const { userId } = data;

    if (!userId) {
      socket.emit("auth_error", { message: "User ID required" });
      return;
    }

    try {
      // Verify user exists in database
      const [users] = await db.execute(
        "SELECT id, name, email FROM users WHERE id = ?",
        [userId]
      );

      if (users.length === 0) {
        socket.emit("auth_error", { message: "Invalid user ID" });
        return;
      }

      const user = users[0];

      // Store user session
      socket.userId = userId;
      socket.user = user;
      activeUsers.set(userId, {
        socketId: socket.id,
        user: user,
        connectedAt: new Date(),
        lastPing: new Date(),
      });

      // Insert/update realtime session in database
      await db.execute(
        `
        INSERT INTO realtime_sessions (id, user_id, socket_id, connected_at, last_ping)
        VALUES (?, ?, ?, NOW(), NOW())
        ON DUPLICATE KEY UPDATE 
        socket_id = VALUES(socket_id),
        connected_at = VALUES(connected_at),
        last_ping = VALUES(last_ping)
      `,
        [`session_${userId}`, userId, socket.id]
      );

      // Join user to their personal room
      socket.join(`user_${userId}`);

      // Acknowledge successful authentication
      socket.emit("authenticated", {
        user: user,
        connectedAt: new Date().toISOString(),
      });

      // Broadcast user online status
      socket.broadcast.emit("user_online", {
        userId: userId,
        user: user,
      });

      console.log(`✅ User authenticated: ${user.name} (ID: ${userId})`);
    } catch (error) {
      console.error("❌ Authentication error:", error);
      socket.emit("auth_error", { message: "Authentication failed" });
    }
  });

  // Handle ping for connection keepalive
  socket.on("ping", async (data) => {
    if (socket.userId) {
      // Update last ping in database
      await db.execute(
        "UPDATE realtime_sessions SET last_ping = NOW() WHERE user_id = ?",
        [socket.userId]
      );

      // Update in memory
      const userSession = activeUsers.get(socket.userId);
      if (userSession) {
        userSession.lastPing = new Date();
      }

      socket.emit("pong", { timestamp: new Date().toISOString() });
    }
  });

  // Handle sending notifications
  socket.on("send_notification", async (data) => {
    const { toUserId, type, title, message, data: notificationData } = data;

    try {
      // Insert notification into database
      const [result] = await db.execute(
        `
        INSERT INTO notifications (user_id, type, title, message, data, created_at)
        VALUES (?, ?, ?, ?, ?, NOW())
      `,
        [toUserId, type, title, message, JSON.stringify(notificationData || {})]
      );

      const notification = {
        id: result.insertId,
        type,
        title,
        message,
        data: notificationData,
        created_at: new Date().toISOString(),
      };

      // Send to specific user if they're online
      io.to(`user_${toUserId}`).emit("new_notification", notification);

      console.log(`📢 Notification sent to user ${toUserId}: ${title}`);
    } catch (error) {
      console.error("❌ Error sending notification:", error);
    }
  });

  // Handle broadcast to all users
  socket.on("broadcast", (data) => {
    socket.broadcast.emit("broadcast_message", {
      from: socket.user,
      ...data,
      timestamp: new Date().toISOString(),
    });
  });

  // Handle disconnect
  socket.on("disconnect", async (reason) => {
    console.log(`🔌 Client disconnected: ${socket.id} (${reason})`);

    if (socket.userId) {
      // Remove from active users
      activeUsers.delete(socket.userId);

      // Remove from database
      await db.execute("DELETE FROM realtime_sessions WHERE user_id = ?", [
        socket.userId,
      ]);

      // Broadcast user offline status
      socket.broadcast.emit("user_offline", {
        userId: socket.userId,
        user: socket.user,
      });

      console.log(
        `👋 User disconnected: ${socket.user?.name} (ID: ${socket.userId})`
      );
    }
  });
});

// Cleanup inactive sessions every 5 minutes
setInterval(async () => {
  try {
    const [result] = await db.execute(`
      DELETE FROM realtime_sessions 
      WHERE last_ping < DATE_SUB(NOW(), INTERVAL 5 MINUTE)
    `);

    if (result.affectedRows > 0) {
      console.log(`🧹 Cleaned up ${result.affectedRows} inactive sessions`);
    }
  } catch (error) {
    console.error("❌ Error cleaning up sessions:", error);
  }
}, 5 * 60 * 1000);

// Start server
async function startServer() {
  await connectToDatabase();

  console.log(`🚀 Socket.IO server running on port ${PORT}`);
  console.log(`🌐 CORS enabled for: ${CORS_ORIGINS.join(", ")}`);
  console.log(`📊 Active users: ${activeUsers.size}`);
}

startServer().catch(console.error);

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🛑 Shutting down Socket.IO server...");

  if (db) {
    await db.end();
    console.log("📊 Database connection closed");
  }

  process.exit(0);
});
