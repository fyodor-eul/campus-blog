
const express = require("express");
const path = require("path");

const { viewPosts } = require("./utils/viewPostUtil");
const { createPost } = require("./utils/MosesHeeUtil");
const { updatePost } = require("./utils/ThihaUtil");
const { addComment, getComments } = require("./utils/JadeTeyUtil");
const { deleteComment } = require("./utils/MosesDeleteCommentUtil");

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

// Comment routes
app.post("/posts/:id/comments", addComment);
app.get("/posts/:id/comments", getComments);
app.delete("/posts/:id/comments/:commentId", deleteComment);

// Start server
app.listen(PORT, () => {
  console.log(`CampusBlog running at http://localhost:${PORT}`);
});