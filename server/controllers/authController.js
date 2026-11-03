import bcrypt from "bcrypt";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import { validateRegister, validateLogin } from "../utils/validators.js";

// The user data we are willing to send to the frontend (never the password)
const formatUser = (user) => ({
  id: user._id,
  username: user.username,
  email: user.email,
});

// POST /api/auth/register
export const register = async (req, res, next) => {
  try {
    const error = validateRegister(req.body);
    if (error) {
      return res.status(400).json({ message: error });
    }

    const username = req.body.username.trim();
    const email = req.body.email.trim().toLowerCase();
    const { password } = req.body;

    // Check if username or email is already taken
    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      return res.status(409).json({ message: "Username or email already exists" });
    }

    // Hash the password. 10 = salt rounds (how much work bcrypt does).
    // bcrypt adds a random salt automatically, so identical passwords get different hashes.
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({ username, email, password: hashedPassword });

    res.status(201).json({ token: generateToken(user._id), user: formatUser(user) });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
export const login = async (req, res, next) => {
  try {
    const error = validateLogin(req.body);
    if (error) {
      return res.status(400).json({ message: error });
    }

    const email = req.body.email.trim().toLowerCase();

    // +password is needed because the schema hides it by default
    const user = await User.findOne({ email }).select("+password");

    // Same message for "no such email" and "wrong password",
    // so attackers cannot discover which emails are registered.
    const passwordMatches = user && (await bcrypt.compare(req.body.password, user.password));
    if (!passwordMatches) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({ token: generateToken(user._id), user: formatUser(user) });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me  (protected)
// The frontend calls this on page refresh to check that the saved token is still valid.
export const getMe = (req, res) => {
  res.json({ user: formatUser(req.user) });
};