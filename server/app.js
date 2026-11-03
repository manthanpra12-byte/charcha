import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

const app = express();

// Only the React app's address may call this API from a browser
app.use(cors({ origin: process.env.CLIENT_URL }));

// Lets Express read JSON sent in request bodies
app.use(express.json());

// Health check: used later for monitoring and deployment checks
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);

// These two must stay LAST
app.use(notFound);
app.use(errorHandler);

export default app;
