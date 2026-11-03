import mongoose from "mongoose";
import Message from "../models/Message.js";
import User from "../models/User.js";

// Turns a database message into a plain object with the same shape
// the REST API returns, so the frontend handles both the same way.
const formatMessage = (m) => ({
  _id: m._id.toString(),
  sender: m.sender.toString(),
  receiver: m.receiver.toString(),
  content: m.content,
  readStatus: m.readStatus,
  createdAt: m.createdAt.toISOString(),
});

const registerMessageHandlers = (io, socket) => {
  // Client sends: { receiverId, content }  plus a callback function (the "acknowledgement")
  socket.on("message:send", async (data, ack) => {
    // If the client did not pass a callback, use an empty function so the code never crashes
    const reply = typeof ack === "function" ? ack : () => {};

    try {
      const receiverId = data?.receiverId;
      const content = typeof data?.content === "string" ? data.content.trim() : "";

      // ---- Validation ----
      if (typeof receiverId !== "string" || !mongoose.isValidObjectId(receiverId)) {
        return reply({ ok: false, error: "Invalid receiver" });
      }
      if (!content) {
        return reply({ ok: false, error: "Message cannot be empty" });
      }
      if (content.length > 1000) {
        return reply({ ok: false, error: "Message is too long (max 1000 characters)" });
      }
      // socket.userId was set from the verified JWT. We never use a sender id from the client.
      if (receiverId === socket.userId) {
        return reply({ ok: false, error: "You cannot message yourself" });
      }

      const receiver = await User.findById(receiverId);
      if (!receiver) {
        return reply({ ok: false, error: "Receiver not found" });
      }

      // ---- Save FIRST, then deliver ----
      const saved = await Message.create({
        sender: socket.userId,
        receiver: receiverId,
        content,
      });
      const message = formatMessage(saved);

      // Deliver to the receiver's room and to the sender's OTHER open tabs.
      // socket.to(...) automatically skips the socket that sent it.
      // If the receiver is offline, the room is empty: nothing is lost because
      // the message is already in MongoDB and shows up in their history.
      socket
        .to([`user:${receiverId}`, `user:${socket.userId}`])
        .emit("message:new", message);

      // Confirm to the sender that the message is saved
      reply({ ok: true, message });
    } catch (err) {
      console.error("message:send error:", err);
      reply({ ok: false, error: "Could not send message" });
    }
  });
};

export default registerMessageHandlers;