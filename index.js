
const express = require("express");
const path = require("path");

const { viewPosts } = require("./utils/viewPostUtil");
const { createPost } = require("./utils/MosesHeeUtil");
const { updatePost } = require("./utils/ThihaUtil");

const app = express();
const PORT = 5050;

// Middleware
app.use(express.json());

// Serve frontend files
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.get("/posts", viewPosts);
app.post("/posts", createPost);
app.put("/posts/:id", updatePost);

// Start server
app.listen(PORT, () => {
  console.log(`CampusBlog running at http://localhost:${PORT}`);
});
