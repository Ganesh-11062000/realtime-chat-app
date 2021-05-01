const socket = io();
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

// DOM query selectors
const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const roomName = document.getElementById("room-name");

// console.log(username,room);

// adding eventListeners
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const msg = e.target.elements.msg.value;
  socket.emit("chatMessage", msg);
  document.getElementById("msg").value = "";
});

// util functions
const outputMessage = (data) => {
  const div = document.createElement("div");
  div.classList.add("message");

  div.innerHTML = `<p class="meta">${data.username} <span>${data.time}</span></p><p class="text">${data.text}</p>`;

  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
};

const outputRoomName = (room) => {
  const roomName = document.getElementById("room-name");
  roomName.innerText = room;
};

const outputRoomUsers = (users) => {
  const userList = document.getElementById("users");

  for (var i = 0; i < users.length; i++) {
    var li = document.createElement("li");
    li.appendChild(document.createTextNode(users[i].username));
    userList.appendChild(li);
  }
};

// socket logic
socket.emit("joinRoom", { username, room });

socket.on("roomUsers", ({ room, users }) => {
  outputRoomName(room);
  outputRoomUsers(users);
});

socket.on("message", (data) => {
  outputMessage(data);
});

socket.on("chatMessage", (chatMsg) => {
  // msg to DOM
  outputMessage(chatMsg);
});
