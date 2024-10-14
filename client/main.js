var socket = io();

// Function to set the username and hide the modal
function setUsername() {
  var username = document.getElementById("username-input").value.trim();
  if (username === "" || username[0] === " ") {
    alert("Username cannot be empty or start with a space.");
    return;
  }
  socket.emit("set username", username);
  document.getElementById("username-modal").style.display = "none";
}

document
  .getElementById("set-username-btn")
  .addEventListener("click", function () {
    setUsername();
  });

document
  .getElementById("username-input")
  .addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      setUsername();
    }
  });

// Submit message to server
document
  .querySelector("#message-form")
  .addEventListener("submit", function (e) {
    e.preventDefault();
    var input = document.querySelector("#message-input");
    var message = input.value.trim();
    if (message === "" || message[0] === " ") {
      alert("Message cannot be empty or start with a space.");
      return;
    }
    socket.emit("chat message", message);
    input.value = "";
  });

// Receive chat messages from server
socket.on("chat message", function (data) {
  var li = document.createElement("li");
  li.innerHTML = `<strong>${data.username}</strong> <span class="text-sm text-gray-500">(${data.time})</span>: ${data.message}`;
  document.querySelector("#messages ul").appendChild(li);
  document.querySelector(".chat-container").scrollTop =
    document.querySelector(".chat-container").scrollHeight;
});

// Receive system messages (like user joins/leaves)
socket.on("system message", function (message) {
  var li = document.createElement("li");
  li.classList.add("system-message");
  li.textContent = message;
  document.querySelector("#messages ul").appendChild(li);
});

// Online users dropdown
document
  .getElementById("online-users-dropdown")
  .addEventListener("click", function () {
    document.getElementById("online-users-list").classList.toggle("hidden");
  });

// Update online users when server sends the list
socket.on("update users", function (users) {
  var onlineCount = users.length;
  document.getElementById("online-count").textContent = `${onlineCount} online`;

  var userList = document.getElementById("online-users-list");
  userList.innerHTML = ""; // Clear the list first
  users.forEach(function (user) {
    var li = document.createElement("li");
    li.className = "p-2 border-b border-gray-200 last:border-0"; // Tailwind classes for each item
    li.textContent = user;
    userList.appendChild(li);
  });
});
