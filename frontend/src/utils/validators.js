// Same rules as the backend, so users see mistakes before the request is sent
export const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

export const isStrongPassword = (password) =>
  password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password);