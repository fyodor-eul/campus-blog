
const fs = require("fs").promises;
const path = require("path");
const Post = require("../models/Post");

const POSTS_FILE = path.join(__dirname, "posts.json");

async function createPost(req, res) {
  try {
    // Validation 1: Validate request using the Post model
    const validation = Post.validateCreate(req.body);

    if (!validation.valid) {
      return res.status(400).json({
        message: validation.message
      });
    }

    const { title, author, content } = req.body;

    const trimmedTitle = title.trim();
    const trimmedAuthor = author.trim();
    const trimmedContent = content.trim();

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

    // Validation 2: Reject posts with the same title, author and content
    const isDuplicate = posts.some(
      (post) =>
        post.title === trimmedTitle &&
        post.author === trimmedAuthor &&
        post.content === trimmedContent
    );

    if (isDuplicate) {
      return res.status(409).json({
        message: "A blog post with the same title, author and content already exists."
      });
    }

    // Generate a unique post ID
    const postId = "P" + Date.now().toString();

    // Create a new post using the Post model
    const newPost = new Post(
      postId,
      trimmedTitle,
      trimmedAuthor,
      trimmedContent,
      new Date().toISOString(),
      null
    );

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
