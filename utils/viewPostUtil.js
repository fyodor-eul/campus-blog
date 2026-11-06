
const fs = require("fs").promises;
const path = require("path");

const POSTS_FILE = path.join(__dirname, "posts.json");

async function viewPosts(req, res) {
  try {
    const data = await fs.readFile(POSTS_FILE, "utf8");
    const allPosts = JSON.parse(data);

    return res.status(200).json(allPosts);

  } catch (error) {

    // Return an empty list if posts.json does not exist
    if (error.code === "ENOENT") {
      return res.status(200).json([]);
    }

    console.error("Error retrieving posts:", error);

    return res.status(500).json({
      message: "Unable to retrieve blog posts."
    });
  }
}

module.exports = { viewPosts };
