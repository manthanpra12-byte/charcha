import mongoose from "mongoose";

// Connects to MongoDB using the address stored in the .env file.
// To move to MongoDB Atlas later, only MONGODB_URI changes.
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1); // stop the app, it cannot work without a database
  }
};

export default connectDB;