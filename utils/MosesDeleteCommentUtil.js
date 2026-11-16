
const fs = require("fs");
const path = require("path");

const postsFile = path.join(__dirname, "posts.json");
const commentsFile = path.join(__dirname, "comments.json");

// Delete a comment from a blog post
function deleteComment(req, res) {
    const postId = req.params.id;
    const commentId = req.params.commentId;
    const { username } = req.body || {};

    // Validate username
    if (
        typeof username !== "string" ||
        username.trim() === ""
    ) {
        return res.status(400).json({
            message: "Username is required to delete a comment."
        });
    }

    try {
        // Read existing blog posts
        const posts = JSON.parse(
            fs.readFileSync(postsFile, "utf8")
        );

        // Check whether the blog post exists
        const postExists = posts.some(
            post => post.postId === postId
        );

        if (!postExists) {
            return res.status(404).json({
                message: "Blog post not found."
            });
        }

        // Read existing comments
        const comments = JSON.parse(
            fs.readFileSync(commentsFile, "utf8")
        );

        // Find the selected comment
        const commentIndex = comments.findIndex(
            comment =>
                comment.commentId === commentId &&
                comment.postId === postId
        );

        // Check whether the comment exists
        if (commentIndex === -1) {
            return res.status(404).json({
                message: "Comment not found."
            });
        }

        // Check whether the username matches
        const originalUsername = comments[commentIndex]
            .username.trim().toLowerCase();

        if (originalUsername !== username.trim().toLowerCase()) {
            return res.status(403).json({
                message: "You can only delete your own comments."
            });
        }

        // Remove the comment
        comments.splice(commentIndex, 1);

        // Save updated comments
        fs.writeFileSync(
            commentsFile,
            JSON.stringify(comments, null, 2)
        );

        return res.status(200).json({
            message: "Comment deleted successfully."
        });

    } catch (error) {
        console.error("Error deleting comment:", error);

        return res.status(500).json({
            message: "Unable to delete comment due to a server error."
        });
    }
}

module.exports = { deleteComment };