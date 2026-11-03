import jwt from "jsonwebtoken";

// Creates a signed JWT that contains only the user's id.
// The secret key is stored in .env, so nobody can forge a valid token without it.
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

export default generateToken;