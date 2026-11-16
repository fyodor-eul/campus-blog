
function createDeleteCommentButton(comment, postId) {
    const deleteButton = document.createElement("button");

    deleteButton.type = "button";
    deleteButton.className = "btn btn-danger";
    deleteButton.textContent = "Delete Comment";

    deleteButton.addEventListener("click", async function () {

        // Ask for username to check comment ownership
        const username = prompt(
            "Enter your username to delete this comment:"
        );

        if (username === null) return;

        if (username.trim() === "") {
            alert("Username cannot be empty.");
            return;
        }

        // Ask for confirmation
        const confirmed = confirm(
            "Are you sure you want to delete this comment?"
        );

        if (!confirmed) return;

        deleteButton.disabled = true;

        try {
            const response = await fetch(
                `/posts/${encodeURIComponent(postId)}/comments/${encodeURIComponent(comment.commentId)}`,
                {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        username: username.trim()
                    })
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "Unable to delete comment."
                );
            }

            alert(result.message);

            // Refresh the comments
            await loadComments(postId);

        } catch (error) {
            alert(error.message);
            deleteButton.disabled = false;
        }
    });

    return deleteButton;
}