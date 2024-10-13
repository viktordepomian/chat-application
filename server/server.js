const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const moment = require("moment-timezone"); // Updated to use moment-timezone

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
    // Use moment-timezone to get the current time in CEST and 24-hour format
    const time = moment().tz("Europe/Berlin").format("HH:mm"); // CEST time in 24-hour format
    const messageData = {
      username: socket.username,
      message: msg,
      time, // 24-hour time in CEST
    };
    io.emit("chat message", messageData);
  });

  socket.on("disconnect", () => {
    io.emit("system message", `${socket.username} has left the chat`);
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Running on port ${PORT}`);
});
