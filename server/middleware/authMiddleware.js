import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Protects routes: only requests with a valid JWT are allowed through.
// Expected header:  Authorization: Bearer <token>
const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized, token missing" });
    }

    const token = header.split(" ")[1];

    // verify throws an error if the token is fake, changed or expired
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // load the user from the database (password is excluded by default)
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "Not authorized, user no longer exists" });
    }

    req.user = user; // controllers after this can use req.user
    next();
  } catch (error) {
    return res.status(401).json({ message: "Not authorized, token invalid or expired" });
  }
};

export default protect;