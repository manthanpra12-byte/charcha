import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 20,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false, // password hash is NOT returned by queries unless we ask for it
    },
  },
  // only keep createdAt (we don't need updatedAt for users)
  { timestamps: { createdAt: true, updatedAt: false } }
);

// unique: true above automatically creates indexes on username and email

export default mongoose.model("User", userSchema);