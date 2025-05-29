import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { connectDB } from "./config/db.js";
import orderRoute from "./routes/orderRoute.js";
import ticketRoute from "./routes/ticketRoute.js";
import userModel from "./model/userModel.js";

dotenv.config();

// App configuration
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

// DB connection
connectDB();

// WebSocket setup changed//////
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Join a room (for specific chat)
  socket.on('joinRoom', ({ roomId }, callback) => {
    console.log('roomId is:', roomId);
    // If roomId is defined, join the room
    if (roomId) {
      socket.join(roomId);
      // Get all room IDs except the socket's own ID
      const joinedRooms = Array.from(socket.rooms).filter(id => id !== socket.id);
      console.log(`Socket ${socket.id} joined rooms:`, joinedRooms);
      if (callback) callback({ success: true, rooms: joinedRooms });
    } else {
      console.log(`Socket ${socket.id} tried to join undefined room`);
      if (callback) callback({ success: false });
    }
  });

  // Listen for messages from one client
  socket.on('sendMessage', ({ roomId, message, sender }) => {
    console.log('sendMessage event received:', { roomId, message, sender });
    // Broadcast to others in the same room
    io.to(roomId).emit('receiveMessage', {
      roomId, // include roomId in the payload
      message,
      sender,
      timestamp: Date.now()
    });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Routes
app.use("/api/orders", orderRoute);
app.use("/api/tickets", ticketRoute);

// API endpoint to handle user login
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid username or password" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (isPasswordCorrect) {
      res.status(200).json({ success: true, message: "Login successful" });
    } else {
      res.status(401).json({ success: false, message: "Invalid username or password" });
    }
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Base route for testing
app.get("/", (req, res) => {
  res.send("API Working");
});

// Server start
server.listen(port, () => console.log(`Server started on http://localhost:${port}`));
