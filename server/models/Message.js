import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    // ObjectId + ref means "this field stores the _id of a document in the User collection"
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true, trim: true, maxlength: 1000 },
    readStatus: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Index 1: speeds up loading a conversation between two users, newest first
messageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });

// Index 2: speeds up counting unread messages for a user
messageSchema.index({ receiver: 1, readStatus: 1 });

export default mongoose.model("Message", messageSchema);