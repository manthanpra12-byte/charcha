import { io } from "socket.io-client";

const API = "http://localhost:5000";

// Logs in through the REST API and returns { token, user }
const login = async (email, password) => {
  const res = await fetch(`${API}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(`Login failed for ${email}`);
  return res.json();
};

// Opens a socket connection with the JWT. Resolves when connected, rejects if refused.
const connect = (token) =>
  new Promise((resolve, reject) => {
    const socket = io(API, { auth: { token } });
    socket.on("connect", () => resolve(socket));
    socket.on("connect_error", (err) => reject(err));
  });

// Sends a message and waits for the server's acknowledgement
const send = (socket, payload) =>
  socket.timeout(3000).emitWithAck("message:send", payload);

const run = async () => {
  const alice = await login("alice@example.com", "Password123");
  const bob = await login("bob@example.com", "Password123");

  // Test 1: a fake token must be refused
  try {
    await connect("not-a-real-token");
    console.log("FAIL 1: fake token was accepted");
  } catch (err) {
    console.log("PASS 1: fake token refused ->", err.message);
  }

  const aliceSocket = await connect(alice.token);
  const bobSocket = await connect(bob.token);
  console.log("PASS 2: alice and bob connected with valid tokens");

  // Test 3: alice sends, bob must receive it in real time, alice gets an acknowledgement
  const bobReceives = new Promise((resolve, reject) => {
    bobSocket.once("message:new", resolve);
    setTimeout(() => reject(new Error("Bob received nothing within 3 seconds")), 3000);
  });
  const ack = await send(aliceSocket, {
    receiverId: bob.user.id,
    content: "Hello Bob, this is a test message",
  });
  console.log(ack.ok ? "PASS 3a: alice got ack, message saved with id" : "FAIL 3a:", ack.message?._id ?? ack.error);
  const received = await bobReceives;
  console.log("PASS 3b: bob received in real time ->", received.content);

  // Test 4: invalid input must be rejected
  const bad1 = await send(aliceSocket, { receiverId: "123", content: "x" });
  console.log(bad1.ok === false ? "PASS 4a: invalid receiver rejected ->" : "FAIL 4a", bad1.error);

  const bad2 = await send(aliceSocket, { receiverId: alice.user.id, content: "me to me" });
  console.log(bad2.ok === false ? "PASS 4b: message to self rejected ->" : "FAIL 4b", bad2.error);

  const bad3 = await send(aliceSocket, { receiverId: bob.user.id, content: "    " });
  console.log(bad3.ok === false ? "PASS 4c: empty message rejected ->" : "FAIL 4c", bad3.error);

  // Test 5: alice pretends to be bob by adding a fake senderId. The server must ignore it.
  const spoof = await send(aliceSocket, {
    senderId: bob.user.id,
    receiverId: bob.user.id,
    content: "spoof attempt",
  });
  // receiver = bob, so this is a normal message from alice; the fake senderId is ignored
  console.log(
    spoof.ok && spoof.message.sender === alice.user.id
      ? "PASS 5: fake senderId ignored, sender is still alice"
      : "FAIL 5: sender was not alice"
  );

  // Test 6: history through the REST API (what the frontend will use after a refresh)
  const res = await fetch(`${API}/api/messages/${bob.user.id}`, {
    headers: { Authorization: `Bearer ${alice.token}` },
  });
  const history = await res.json();
  console.log(`PASS 6: history returned ${history.length} saved message(s). Last one: "${history[history.length - 1].content}"`);

  aliceSocket.close();
  bobSocket.close();
  process.exit(0);
};

run().catch((err) => {
  console.error("Test script error:", err.message);
  process.exit(1);
});