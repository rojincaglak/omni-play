import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

// Enable CORS for frontend requests
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  methods: ["GET", "POST"]
}));

app.use(express.json());

// Base HTTP healthcheck endpoint
app.get("/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Create HTTP server
const server = http.createServer(app);

// Create Socket.io server
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

interface Player {
  socketId: string;
  nickname: string;
  isOwner: boolean;
}

interface Room {
  code: string;
  players: Player[];
}

// In-memory rooms store
const rooms = new Map<string, Room>();

// Generate a random 4-character room code
function generateRoomCode(): string {
  const chars = "ABCDEFGHIJKLMNPQRSTUVWXYZ123456789"; // Removed confusing O and 0
  let code = "";
  do {
    code = "";
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  } while (rooms.has(code));
  return code;
}

// Socket connection handler
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Ping-pong verification
  socket.on("ping_server", (data: any) => {
    socket.emit("pong_server", { message: "pong", timestamp: new Date().toISOString() });
  });

  // Create room handler
  socket.on("create_room", ({ nickname }: { nickname: string }) => {
    if (!nickname || nickname.trim() === "") {
      socket.emit("room_error", { message: "Geçersiz takma ad." });
      return;
    }

    const roomCode = generateRoomCode();
    const newRoom: Room = {
      code: roomCode,
      players: [
        {
          socketId: socket.id,
          nickname: nickname.trim(),
          isOwner: true,
        },
      ],
    };

    rooms.set(roomCode, newRoom);
    socket.join(roomCode);
    console.log(`Room created: ${roomCode} by ${nickname}`);
    socket.emit("room_created", { roomCode, players: newRoom.players });
  });

  // Join room handler
  socket.on("join_room", ({ roomCode, nickname }: { roomCode: string; nickname: string }) => {
    const formattedCode = roomCode?.trim().toUpperCase();
    if (!formattedCode || !nickname || nickname.trim() === "") {
      socket.emit("room_error", { message: "Eksik oda kodu veya takma ad." });
      return;
    }

    const room = rooms.get(formattedCode);
    if (!room) {
      socket.emit("room_error", { message: "Oda bulunamadı." });
      return;
    }

    // Check if nickname already taken in this room
    const isNameTaken = room.players.some(p => p.nickname.toLowerCase() === nickname.trim().toLowerCase());
    if (isNameTaken) {
      socket.emit("room_error", { message: "Bu isim oda içinde zaten kullanılıyor." });
      return;
    }

    const newPlayer: Player = {
      socketId: socket.id,
      nickname: nickname.trim(),
      isOwner: false,
    };

    room.players.push(newPlayer);
    socket.join(formattedCode);
    console.log(`Player ${nickname} joined room ${formattedCode}`);

    // Notify client they joined successfully
    socket.emit("room_joined", { roomCode: formattedCode, players: room.players });

    // Notify other players in the room
    socket.to(formattedCode).emit("player_joined", {
      nickname: newPlayer.nickname,
      players: room.players,
    });
  });

  // Leave room handler
  socket.on("leave_room", () => {
    handlePlayerLeave(socket);
  });

  // Clean up on disconnect
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
    handlePlayerLeave(socket);
  });
});

// Helper function to remove a player from their room and clean up if empty
function handlePlayerLeave(socket: any) {
  for (const [roomCode, room] of rooms.entries()) {
    const playerIndex = room.players.findIndex((p) => p.socketId === socket.id);
    if (playerIndex !== -1) {
      const removedPlayer = room.players[playerIndex];
      room.players.splice(playerIndex, 1);
      socket.leave(roomCode);
      console.log(`Player ${removedPlayer.nickname} left room ${roomCode}`);

      // If room is empty or the owner left, close the room
      if (room.players.length === 0 || removedPlayer.isOwner) {
        rooms.delete(roomCode);
        console.log(`Room closed: ${roomCode}`);
        socket.to(roomCode).emit("room_closed", { message: "Oda kurucusu ayrıldığı için oda kapatıldı." });
      } else {
        // Notify remaining players
        socket.to(roomCode).emit("player_left", {
          nickname: removedPlayer.nickname,
          players: room.players,
        });
      }
      break; // Player can only be in one room at a time
    }
  }
}

// Start listening
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
