// Runs when no route matches the URL
export const notFound = (req, res) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
};

// Central place for all errors, so every error returns the same JSON shape
export const errorHandler = (err, req, res, next) => {
  console.error(err);

  // MongoDB duplicate key error (username or email already used)
  if (err.code === 11000) {
    return res.status(409).json({ message: "Username or email already exists" });
  }

  // Mongoose schema validation error
  if (err.name === "ValidationError") {
    return res.status(400).json({ message: err.message });
  }

  // Anything else: don't leak internal details to the client
  res.status(500).json({ message: "Something went wrong on the server" });
};