const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const moment = require("moment-timezone");
const mongoose = require("mongoose");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// MongoDB connection setup
mongoose
  .connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

// Define a schema for chat messages
const messageSchema = new mongoose.Schema({
  username: String,
  message: String,
  time: String,
});

// Create a model for messages
const Message = mongoose.model("Message", messageSchema);

app.use(express.static("client"));

io.on("connection", (socket) => {
  console.log("a user connected");

  // Load last 50 messages from the database and send to the client
  Message.find()
    .sort({ _id: -1 })
    .limit(50)
    .exec((err, messages) => {
      if (!err) {
        // Send the messages in reverse order (oldest to newest)
        socket.emit("load messages", messages.reverse());
      }
    });

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

    // Save message to MongoDB
    const newMessage = new Message(messageData);
    newMessage.save((err) => {
      if (err) {
        console.error("Error saving message:", err);
      }
    });

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
