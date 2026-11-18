
class Post {
    constructor(postId, title, author, content, createdAt, updatedAt = null) {
        this.postId = postId;
        this.title = title;
        this.author = author;
        this.content = content;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    static validateCreate(data) {
        if (!data || typeof data !== "object" || Array.isArray(data)) {
            return { valid: false, message: "Invalid request body" };
        }

        const allowedFields = ["title", "author", "content"];

        const extraFields = Object.keys(data).filter(
            field => !allowedFields.includes(field)
        );

        if (extraFields.length > 0) {
            return {
                valid: false,
                message: `Unexpected fields: ${extraFields.join(", ")}`
            };
        }

        const limits = {
            title: 100,
            author: 50,
            content: 5000
        };

        for (const [field, maxLength] of Object.entries(limits)) {
            if (typeof data[field] !== "string" || !data[field].trim()) {
                return {
                    valid: false,
                    message: `${field} is required and must be a non-empty string`
                };
            }

            if (data[field].length > maxLength) {
                return {
                    valid: false,
                    message: `${field} must not exceed ${maxLength} characters`
                };
            }
        }

        return { valid: true };
    }
}

module.exports = Post;
