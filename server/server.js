const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const moment = require("moment-timezone");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("client"));

io.on("connection", (socket) => {
  console.log("a user connected");

  // Listen for new user with username
  socket.on("set username", (username) => {
    socket.username = username;
    io.emit("system message", `${username} has joined the chat`);
  });

  // Listen for chat messages
  socket.on("chat message", (msg) => {
    // Get current time in CEST
    const time = moment().tz("Europe/Berlin").format("HH:mm");

    const messageData = {
      username: socket.username,
      message: msg,
      time,
    };

    // Emit the message to all clients
    io.emit("chat message", messageData);
  });

  // Listen for user disconnect
  socket.on("disconnect", () => {
    if (socket.username) {
      io.emit("system message", `${socket.username} has left the chat`);
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Running on port ${PORT}`);
});
