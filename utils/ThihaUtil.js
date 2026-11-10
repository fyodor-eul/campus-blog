const fs = require("fs").promises;
const path = require("path");

const POSTS_FILE = path.join(__dirname, "posts.json");
const TEMPLATE_FILE = path.join(__dirname, "posts.template.json");

// Keep these in line with the limits used by the Create Post feature
const MAX_TITLE_LENGTH = 100;
const MAX_CONTENT_LENGTH = 5000;

// Read posts.json, creating it from the template if it does not exist yet
async function readPosts() {
  try {
    const data = await fs.readFile(POSTS_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    if (error.code === "ENOENT") {
      await fs.copyFile(TEMPLATE_FILE, POSTS_FILE);
      const data = await fs.readFile(POSTS_FILE, "utf8");
      return JSON.parse(data);
    }
    throw error;
  }
}

// PUT /posts/:id
async function updatePost(req, res) {
  try {
    const { id } = req.params;
    const { title, content } = req.body || {};

    // Error case: missing or empty fields
    if (
      typeof title !== "string" ||
      typeof content !== "string" ||
      title.trim() === "" ||
      content.trim() === ""
    ) {
      return res.status(400).json({ message: "Title and content are required." });
    }

    const newTitle = title.trim();
    const newContent = content.trim();

    // Error case: input too long
    if (newTitle.length > MAX_TITLE_LENGTH) {
      return res.status(400).json({
        message: `Title must not exceed ${MAX_TITLE_LENGTH} characters.`
      });
    }
    if (newContent.length > MAX_CONTENT_LENGTH) {
      return res.status(400).json({
        message: `Content must not exceed ${MAX_CONTENT_LENGTH} characters.`
      });
    }

    const posts = await readPosts();

    // Error case: post does not exist
    const index = posts.findIndex((post) => post.postId === id);
    if (index === -1) {
      return res.status(404).json({ message: "Blog post not found." });
    }

    // Error case: the update would make this post identical to another post.
    // Same rule as Create Post: same title, author and content.
    // The author doesn't change on update, so use the existing author.
    const author = posts[index].author;
    const duplicate = posts.some(
      (post) =>
        post.postId !== id &&
        post.title === newTitle &&
        post.author === author &&
        post.content === newContent
    );
    if (duplicate) {
      return res.status(409).json({
        message: "A blog post with the same title, author and content already exists."
      });
    }

    // Success case: update the post and save
    posts[index] = {
      ...posts[index],
      title: newTitle,
      content: newContent,
      updatedAt: new Date().toISOString()
    };

    await fs.writeFile(POSTS_FILE, JSON.stringify(posts, null, 2), "utf8");

    return res.status(200).json({
      message: "Blog post updated successfully.",
      post: posts[index]
    });
  } catch (error) {
    console.error("Error updating post:", error);
    return res.status(500).json({ message: "Unable to update blog post." });
  }
}

module.exports = { updatePost };
