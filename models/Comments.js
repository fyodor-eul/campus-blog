
class Comment {
    constructor(commentId, postId, username, content, createdAt) {
        this.commentId = commentId;
        this.postId = postId;
        this.username = username;
        this.content = content;
        this.createdAt = createdAt;
    }

    // Validate incoming comment requests
    static validateCreate(data) {

        // Check if request body is valid
        if (!data || typeof data !== "object" || Array.isArray(data)) {
            return {
                valid: false,
                message: "Invalid request body."
            };
        }

        // Only username and content are allowed
        const allowedFields = ["username", "content"];

        const extraFields = Object.keys(data).filter(
            field => !allowedFields.includes(field)
        );

        // Reject unexpected fields
        if (extraFields.length > 0) {
            return {
                valid: false,
                message: `Unexpected fields: ${extraFields.join(", ")}`
            };
        }

        // Check empty fields
        if (
            typeof data.username !== "string" ||
            typeof data.content !== "string" ||
            data.username.trim() === "" ||
            data.content.trim() === ""
        ) {
            return {
                valid: false,
                message: "Username and comment cannot be empty."
            };
        }

        // Check username length
        if (data.username.trim().length > 50) {
            return {
                valid: false,
                message: "Username cannot exceed 50 characters."
            };
        }

        // Check comment length
        if (data.content.trim().length > 500) {
            return {
                valid: false,
                message: "Comment cannot exceed 500 characters."
            };
        }

        return { valid: true };
    }
}

module.exports = Comment;
