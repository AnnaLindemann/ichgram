import { io } from "socket.io-client";

const SERVER_URL = "http://localhost:5000";
const CONVERSATION_ID = "69bbb9c57c277aecf1716f49";

const token = process.argv[2];
const label = process.argv[3] ?? "USER";

if (!token) {
  console.error("Token is required");
  process.exit(1);
}

const socket = io(SERVER_URL, {
  auth: {
    token: `Bearer ${token}`,
  },
});

socket.on("connect", () => {
  console.log(`[${label}] connected:`, socket.id);

  socket.emit("chat:join", CONVERSATION_ID);
  console.log(`[${label}] chat:join sent:`, CONVERSATION_ID);
});

socket.on("connect_error", (error) => {
  console.log(`[${label}] connect_error:`, error.message);
});

socket.on("socket:ready", (payload) => {
  console.log(`[${label}] socket:ready`);
  console.log(payload);
});

// ✅ NEW MESSAGE
socket.on("message:new", (payload) => {
  console.log(`\n[${label}] message:new`);
  console.log(JSON.stringify(payload, null, 2));
});

// ✅ NOTIFICATION
socket.on("notification:new", (payload) => {
  console.log(`\n[${label}] notification:new`);
  console.log(JSON.stringify(payload, null, 2));
});

// ✅ MESSAGE DELETED
socket.on("message:deleted", (payload) => {
  console.log(`\n[${label}] message:deleted`);
  console.log(JSON.stringify(payload, null, 2));
});

// ✅ MESSAGE READ
socket.on("message:read", (payload) => {
  console.log(`\n[${label}] message:read`);
  console.log(JSON.stringify(payload, null, 2));
});

socket.on("disconnect", (reason) => {
  console.log(`[${label}] disconnect:`, reason);
});