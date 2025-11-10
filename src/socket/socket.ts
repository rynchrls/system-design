import app from "../index.js";
import http from "http";
import { Server, Socket } from "socket.io";

const server: http.Server = http.createServer(app);

interface UserSocketMap {
  [key: string]: string;
}

const io = new Server(server, {
  pingInterval: 25000, // send ping every 25s
  pingTimeout: 20000, // disconnect if no pong after 20s
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  },
});

const userSocketmap: UserSocketMap = {};

io.on("connection", (socket: Socket) => {
  console.log("a user connected", socket.id);
  const id = socket.handshake.query.id as string | undefined;
  if (id) {
    userSocketmap[id] = socket.id;
  }

  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id);
    delete userSocketmap[id as string];
  });
});

export { io, server };
