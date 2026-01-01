// server/server.js
import dotenv from "dotenv";
dotenv.config();
import http from "http";
import { Server } from "socket.io";
import app from "./src/app.js";
import connectDB from "./src/config/db.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    // 1. Create HTTP server
    const httpServer = http.createServer(app);

    // 2. Initialize Socket.IO with enhanced config
    const io = new Server(httpServer, {
      pingTimeout: 60000,
      pingInterval: 25000,
      cors: {
        origin: ["http://localhost:5173", "http://localhost:3000"],
        credentials: true,
      },
      transports: ['websocket', 'polling'],
      allowEIO3: true
    });

    // 3. Store active users
    const activeUsers = new Map();

    // 4. Socket Event Logic
    io.on("connection", (socket) => {
      console.log("🟢 User Connected to Socket:", socket.id);

      // Setup - Join user room
      socket.on("setup", (userData) => {
        if (userData?._id) {
          socket.join(userData._id);
          activeUsers.set(userData._id, socket.id);
          socket.emit("connected");
          console.log(`User ${userData.username} (${userData._id}) connected`);
        }
      });

      // Join conversation room
      socket.on("join_conversation", (conversationId) => {
        socket.join(conversationId);
        console.log(`User joined conversation: ${conversationId}`);
      });

      // Leave conversation room
      socket.on("leave_conversation", (conversationId) => {
        socket.leave(conversationId);
        console.log(`User left conversation: ${conversationId}`);
      });

      // Typing indicators
      socket.on("typing", (data) => {
        const { conversationId, userId } = data;
        socket.to(conversationId).emit("typing", {
          conversationId,
          userId,
          timestamp: new Date()
        });
      });

      socket.on("stop_typing", (data) => {
        const { conversationId, userId } = data;
        socket.to(conversationId).emit("stop_typing", {
          conversationId,
          userId,
          timestamp: new Date()
        });
      });

      // Send Message Event
      socket.on("send_message", (newMessage) => {
        const { conversation, sender } = newMessage;
        
        if (!conversation?.participants) {
          return console.log("Invalid message data");
        }

        // Emit to conversation room
        socket.to(conversation._id).emit("message_received", newMessage);
        
        // Also emit to individual user rooms for offline notification
        conversation.participants.forEach((participant) => {
          if (participant._id !== sender._id) {
            socket.to(participant._id).emit("new_message_notification", {
              conversationId: conversation._id,
              message: newMessage,
              unreadCount: 1
            });
          }
        });

        console.log(`Message sent in conversation ${conversation._id}`);
      });

      // Message Read Receipt
      socket.on("message_read", (data) => {
        const { messageId, conversationId } = data;
        socket.to(conversationId).emit("message_read", {
          messageId,
          userId: socket.userId,
          timestamp: new Date()
        });
      });

      // Reaction Added
      socket.on("reaction_added", (data) => {
        const { messageId, conversationId, reaction } = data;
        socket.to(conversationId).emit("reaction_added", {
          messageId,
          reaction,
          timestamp: new Date()
        });
      });

      // User Status
      socket.on("user_status", (data) => {
        const { userId, status } = data; // online, away, offline
        activeUsers.set(userId, socket.id);
        
        // Notify user's conversations
        socket.broadcast.emit("user_status_changed", {
          userId,
          status,
          lastSeen: new Date()
        });
      });

      // Disconnect
      socket.on("disconnect", () => {
        console.log("🔴 User Disconnected:", socket.id);
        
        // Remove from active users
        for (const [userId, socketId] of activeUsers.entries()) {
          if (socketId === socket.id) {
            activeUsers.delete(userId);
            
            // Notify others
            socket.broadcast.emit("user_status_changed", {
              userId,
              status: "offline",
              lastSeen: new Date()
            });
            
            break;
          }
        }
      });

      // Error handling
      socket.on("error", (error) => {
        console.error("Socket error:", error);
      });
    });

    // 5. Start server
    httpServer.listen(PORT, () => {
      console.log(`
╔═══════════════════════════════════════════════════════╗
║         🚀 Server & Socket.IO Running                 ║
╠═══════════════════════════════════════════════════════╣
║  📍 Port: ${PORT}                                    ║
║  📡 Socket: Enabled (Enhanced)                        ║
║  👥 Active Users: ${activeUsers.size}                ║
╚═══════════════════════════════════════════════════════╝
      `);
    });

  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();