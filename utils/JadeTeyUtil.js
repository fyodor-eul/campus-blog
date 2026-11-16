
const fs = require("fs");
const path = require("path");

const postsFile = path.join(__dirname, "posts.json");
const commentsFile = path.join(__dirname, "comments.json");

// Add a new comment to a blog post
function addComment(req, res) {
    const postId = req.params.id;
    const { username, content } = req.body || {};

    // Check for empty username or comment
    if (
        typeof username !== "string" ||
        typeof content !== "string" ||
        username.trim() === "" ||
        content.trim() === ""
    ) {
        return res.status(400).json({
            message: "Username and comment cannot be empty."
        });
    }

    // Check username length
    if (username.trim().length > 50) {
        return res.status(400).json({
            message: "Username cannot exceed 50 characters."
        });
    }

    // Check comment length
    if (content.trim().length > 500) {
        return res.status(400).json({
            message: "Comment cannot exceed 500 characters."
        });
    }

    try {
        // Read existing blog posts
        const posts = JSON.parse(
            fs.readFileSync(postsFile, "utf8")
        );

        // Check if the blog post exists
        const postExists = posts.some(post =>
            post.postId === postId
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

        // Check for duplicate comments
        const duplicateComment = comments.some(comment =>
            comment.postId === postId &&
            comment.username.trim().toLowerCase() ===
                username.trim().toLowerCase() &&
            comment.content.trim().toLowerCase() ===
                content.trim().toLowerCase()
        );

        if (duplicateComment) {
            return res.status(409).json({
                message: "You have already posted this comment."
            });
        }

        // Generate the next comment ID
        const nextId = Math.max(
            0,
            ...comments.map(comment =>
                Number(comment.commentId.slice(1)) || 0
            )
        ) + 1;

        const commentId = "C" + String(nextId).padStart(3, "0");

        // Create the new comment
        const newComment = {
            commentId: commentId,
            postId: postId,
            username: username.trim(),
            content: content.trim(),
            createdAt: new Date().toISOString()
        };

        // Add the comment to the array
        comments.push(newComment);

        // Save the updated comments to JSON
        fs.writeFileSync(
            commentsFile,
            JSON.stringify(comments, null, 2)
        );

        // Return success response
        return res.status(201).json({
            message: "Comment added successfully.",
            comment: newComment
        });

    } catch (error) {
        console.error("Error adding comment:", error);

        return res.status(500).json({
            message: "Unable to add comment due to a server error."
        });
    }
}

// Retrieve comments for a selected blog post
function getComments(req, res) {
    const postId = req.params.id;

    try {
        // Read existing comments
        const comments = JSON.parse(
            fs.readFileSync(commentsFile, "utf8")
        );

        // Filter comments by blog post ID
        const postComments = comments.filter(comment =>
            comment.postId === postId
        );

        // Return matching comments
        return res.status(200).json(postComments);

    } catch (error) {
        console.error("Error retrieving comments:", error);

        return res.status(500).json({
            message: "Unable to retrieve comments."
        });
    }
}

// Export both functions
module.exports = { addComment, getComments };