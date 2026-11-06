
const fs = require("fs").promises;
const path = require("path");

const POSTS_FILE = path.join(__dirname, "posts.json");

async function createPost(req, res) {
  try {
    const { title, author, content } = req.body || {};

    // Validation 1: All fields are required
    if (
      typeof title !== "string" ||
      typeof author !== "string" ||
      typeof content !== "string" ||
      !title.trim() ||
      !author.trim() ||
      !content.trim()
    ) {
      return res.status(400).json({
        message: "Title, author and content are required."
      });
    }

    // Validation 2: Maximum input lengths
    if (
      title.trim().length > 100 ||
      author.trim().length > 50 ||
      content.trim().length > 5000
    ) {
      return res.status(400).json({
        message: "Input exceeds the maximum allowed length."
      });
    }

    // Read existing posts
    let posts = [];

    try {
      const data = await fs.readFile(POSTS_FILE, "utf8");
      posts = JSON.parse(data);

      if (!Array.isArray(posts)) {
        throw new Error("Invalid posts data format");
      }
    } catch (error) {
      if (error.code !== "ENOENT") {
        throw error;
      }
    }

    // Generate a unique post ID
    const postId = "P" + Date.now().toString();

    // Create the new post
    const newPost = {
      postId,
      title: title.trim(),
      author: author.trim(),
      content: content.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: null
    };

    // Save to posts.json
    posts.push(newPost);

    await fs.writeFile(
      POSTS_FILE,
      JSON.stringify(posts, null, 2),
      "utf8"
    );

    return res.status(201).json({
      message: "Blog post created successfully.",
      post: newPost
    });

  } catch (error) {
    console.error("Error creating post:", error);

    return res.status(500).json({
      message: "Unable to create blog post."
    });
  }
}

module.exports = { createPost };
