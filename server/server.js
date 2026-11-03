import "dotenv/config"; // must be first: loads .env before anything reads process.env
import http from "http";
import app from "./app.js";
import connectDB from "./config/db.js";
import setupSocket from "./socket/index.js";

// Stop immediately if the JWT secret is missing, rather than running insecurely
if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET is missing in .env");
  process.exit(1);
}

const PORT = process.env.PORT || 5000;

// Socket.IO attaches to the same HTTP server as Express,
// so REST and WebSocket traffic share one port (5000)
const server = http.createServer(app);
setupSocket(server);

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});