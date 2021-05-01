const path = require("path");
const http = require("http");
const express = require("express");
const app = express();
const formatMessage = require("./utils/messages");
const socketio = require("socket.io");
const {
  userJoin,
  userLeave,
  getCurrentUser,
  getRoomUsers,
} = require("./utils/users");

const server = http.createServer(app);
const io = socketio(server);

const botName = "ChatCord Bot";

// serving static files
app.use(express.static(path.join(__dirname, "public")));

io.on("connection", (socket) => {
  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

    // greeting once when user connects
    socket.emit("message", formatMessage(botName, "Welcome to our ChatApp"));

    // acknowledging other users
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage(botName, `${username} has joined the chat!`)
      );

    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  socket.on("chatMessage", (msg) => {
    const user = getCurrentUser(socket.id);
    io.emit("chatMessage", formatMessage(user.username, msg));
  });

  // user has left the chat
  socket.on("disconnect", () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        "message",
        formatMessage(botName, `${user.username} has left the chat`)
      );
    }
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
