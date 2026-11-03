const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const usernamePattern = /^[a-zA-Z0-9_]{3,20}$/;

// Each function returns an error message (string) or null if the input is fine.
// The typeof checks matter: they block attacks where an object is sent instead of text.

export const validateRegister = ({ username, email, password }) => {
  if (
    typeof username !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string"
  ) {
    return "Username, email and password are required";
  }
  if (!usernamePattern.test(username.trim())) {
    return "Username must be 3-20 characters: letters, numbers or underscore";
  }
  if (!emailPattern.test(email.trim())) {
    return "Please enter a valid email address";
  }
  if (password.length < 8) {
    return "Password must be at least 8 characters";
  }
  return null;
};

export const validateLogin = ({ email, password }) => {
  if (typeof email !== "string" || typeof password !== "string") {
    return "Email and password are required";
  }
  if (!email.trim() || !password) {
    return "Email and password are required";
  }
  return null;
};