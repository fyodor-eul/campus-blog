
const commentNameInput = document.getElementById("comment-name");
const commentContentInput = document.getElementById("comment-content");
const addCommentButton = document.getElementById("add-comment-btn");
const commentMessage = document.getElementById("comment-message");
const commentsContainer = document.getElementById("comments-container");

// Retrieve and display comments for a selected blog post
async function loadComments(postId) {
    commentsContainer.textContent = "Loading comments...";

    try {
        const response = await fetch(
            `/posts/${encodeURIComponent(postId)}/comments`
        );

        if (!response.ok) {
            throw new Error("Unable to retrieve comments.");
        }

        const comments = await response.json();

        if (!Array.isArray(comments)) {
            throw new Error("Invalid comments data.");
        }

        commentsContainer.replaceChildren();

        if (comments.length === 0) {
            commentsContainer.textContent = "No comments yet.";
            return;
        }

        // Display each comment
        comments.forEach(comment => {
            const commentCard = document.createElement("div");
            commentCard.className = "comment-card";

            const username = document.createElement("strong");
            username.textContent = comment.username;

            const content = document.createElement("p");
            content.textContent = comment.content;

            const date = document.createElement("small");
            date.textContent = new Date(
                comment.createdAt
            ).toLocaleDateString("en-SG");

            commentCard.append(username, content, date);
            commentsContainer.appendChild(commentCard);
        });

    } catch (error) {
        console.error("Error loading comments:", error);
        commentsContainer.textContent =
            "Unable to load comments. Please try again.";
    }
}

// Handle Post Comment button click
addCommentButton.addEventListener("click", async function () {
    const username = commentNameInput.value.trim();
    const content = commentContentInput.value.trim();

    // Check for empty username or comment
    if (username === "" || content === "") {
        commentMessage.textContent =
            "Username and comment cannot be empty.";
        return;
    }

    // Check username length
    if (username.length > 50) {
        commentMessage.textContent =
            "Username cannot exceed 50 characters.";
        return;
    }

    // Check comment length
    if (content.length > 500) {
        commentMessage.textContent =
            "Comment cannot exceed 500 characters.";
        return;
    }

    // Check that a blog post is selected
    if (!selectedPostId) {
        commentMessage.textContent =
            "Please select a blog post first.";
        return;
    }

    // Prevent multiple submissions while the request is running
    addCommentButton.disabled = true;

    try {
        // Send the new comment to the backend
        const response = await fetch(
            `/posts/${encodeURIComponent(selectedPostId)}/comments`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username: username,
                    content: content
                })
            }
        );

        const result = await response.json();

        // Display an error if the backend rejects the comment
        if (!response.ok) {
            commentMessage.textContent =
                result.message || "Unable to add comment.";
            return;
        }

        // Display success message
        commentMessage.textContent =
            result.message || "Comment added successfully.";

        // Clear the comment field
        commentContentInput.value = "";

        // Refresh comments after successful submission
        await loadComments(selectedPostId);

    } catch (error) {
        console.error("Error adding comment:", error);
        commentMessage.textContent =
            "Unable to add comment. Please try again.";

    } finally {
        addCommentButton.disabled = false;
    }
});