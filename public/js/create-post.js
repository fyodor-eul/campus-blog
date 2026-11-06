
const createPostView = document.getElementById("create-post-view");
const createPostForm = document.getElementById("create-post-form");
const createPostMessage = document.getElementById("create-post-message");
const submitPostBtn = document.getElementById("submit-post-btn");

// ==========================================
// Close Create Post Form
// ==========================================
function closeCreatePost() {
  createPostView.classList.add("hidden");

  document.getElementById("post-detail-view").classList.add("hidden");
  document.getElementById("home-view").classList.remove("hidden");

  window.scrollTo(0, 0);
}

// Back to Blogs button
document.getElementById("create-back-btn").addEventListener("click", closeCreatePost);

// Cancel button
document.getElementById("cancel-create-btn").addEventListener("click", closeCreatePost);

// ==========================================
// Create Blog Post
// ==========================================
createPostForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  // Get input values
  const title = document.getElementById("post-title").value.trim();
  const author = document.getElementById("post-author").value.trim();
  const content = document.getElementById("post-content").value.trim();

  // Clear previous messages
  createPostMessage.textContent = "";
  createPostMessage.className = "";

  // Validation 1: Required fields
  if (!title || !author || !content) {
    createPostMessage.textContent =
      "Please fill in all required fields.";
    createPostMessage.className = "error";
    return;
  }

  // Validation 2: Maximum input lengths
  if (
    title.length > 100 ||
    author.length > 50 ||
    content.length > 5000
  ) {
    createPostMessage.textContent =
      "One or more fields exceed the maximum allowed length.";
    createPostMessage.className = "error";
    return;
  }

  // Prevent repeated submissions
  submitPostBtn.disabled = true;
  submitPostBtn.textContent = "Publishing...";

  try {
    const response = await fetch("/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title,
        author,
        content
      })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to create blog post.");
    }

    // Display success message
    createPostMessage.textContent = "Blog post published successfully!";
    createPostMessage.className = "success";

    // Clear form
    createPostForm.reset();

    // Refresh blog posts
    await loadPosts();

    // Return to homepage
    closeCreatePost();

  } catch (error) {
    console.error("Error creating blog post:", error);

    createPostMessage.textContent = error.message;
    createPostMessage.className = "error";

  } finally {
    submitPostBtn.disabled = false;
    submitPostBtn.textContent = "Publish Post";
  }
});
