
const express = require("express");
const path = require("path");

const { viewPosts } = require("./utils/viewPostUtil");

const app = express();
const PORT = 5050;

// Middleware
app.use(express.json());

// Serve frontend files
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.get("/posts", viewPosts);

// Start server
app.listen(PORT, () => {
  console.log(`CampusBlog running at http://localhost:${PORT}`);
});
