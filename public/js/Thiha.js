// Thiha's Update Blog Post feature (frontend)
(() => {
  // Keep these in line with ThihaUtil.js and the Create Post form
  const MAX_TITLE_LENGTH = 100;
  const MAX_CONTENT_LENGTH = 5000;

  const detailView = document.getElementById("post-detail-view");
  const updateView = document.getElementById("update-post-view");
  const updatePostBtn = document.getElementById("update-post-btn");

  const form = document.getElementById("update-post-form");
  const titleInput = document.getElementById("update-title");
  const contentInput = document.getElementById("update-content");
  const message = document.getElementById("update-post-message");
  const submitBtn = document.getElementById("update-submit-btn");
  const cancelBtn = document.getElementById("update-cancel-btn");
  const backBtn = document.getElementById("update-back-btn");

  let currentPost = null;

  function showMessage(text, type) {
    message.textContent = text;
    message.style.color = type === "success" ? "#15803d" : "#dc2626";
  }

  function clearMessage() {
    message.textContent = "";
  }

  function showUpdateView() {
    detailView.classList.add("hidden");
    updateView.classList.remove("hidden");
  }

  function showDetailView() {
    updateView.classList.add("hidden");
    detailView.classList.remove("hidden");
    clearMessage();
  }

  // Find the post currently shown in the detail view.
  async function findCurrentPost() {
    const response = await fetch("/posts");
    if (!response.ok) {
      throw new Error("Unable to load blog posts.");
    }
    const posts = await response.json();

    // view-posts.js stores the ID of the open post in selectedPostId
    if (typeof selectedPostId !== "undefined" && selectedPostId) {
      return posts.find((post) => post.postId === selectedPostId) || null;
    }

    // Fallback: match what is shown on the page.
    // Title + author + content identifies a post uniquely
    // (the same rule as the duplicate check in Create/Update Post).
    const title = document.getElementById("detail-title").textContent.trim();
    const author = document.getElementById("detail-author").textContent;
    const content = document.getElementById("detail-content").textContent.trim();

    const matches = posts.filter(
      (post) => post.title === title && post.content.trim() === content
    );
    if (matches.length <= 1) {
      return matches[0] || null;
    }
    return matches.find((post) => author.includes(post.author)) || matches[0];
  }

  // Returns an error message, or null if the input is valid
  function validate(title, content) {
    if (title === "" || content === "") {
      return "Title and content are required.";
    }
    if (title.length > MAX_TITLE_LENGTH) {
      return `Title must not exceed ${MAX_TITLE_LENGTH} characters.`;
    }
    if (content.length > MAX_CONTENT_LENGTH) {
      return `Content must not exceed ${MAX_CONTENT_LENGTH} characters.`;
    }
    return null;
  }

  // Open the form, pre-filled with the current post
  updatePostBtn.addEventListener("click", async () => {
    clearMessage();
    try {
      currentPost = await findCurrentPost();
    } catch (error) {
      currentPost = null;
    }

    showUpdateView();

    if (!currentPost) {
      titleInput.value = "";
      contentInput.value = "";
      showMessage("Unable to find this blog post. Please go back and try again.", "error");
      submitBtn.disabled = true;
      return;
    }

    submitBtn.disabled = false;
    titleInput.value = currentPost.title;
    contentInput.value = currentPost.content;
    titleInput.focus();
  });

  // Submit the update
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!currentPost) return;

    const title = titleInput.value.trim();
    const content = contentInput.value.trim();

    // Frontend validation: give feedback before sending the request
    const error = validate(title, content);
    if (error) {
      showMessage(error, "error");
      return;
    }

    // No request needed if nothing was changed (the backend checks this too)
    if (
      title === currentPost.title.trim() &&
      content === currentPost.content.trim()
    ) {
      showMessage("No changes were made.", "error");
      return;
    }

    submitBtn.disabled = true;
    showMessage("Saving changes...", "success");

    try {
      const response = await fetch(`/posts/${encodeURIComponent(currentPost.postId)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content })
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        // 400 invalid input, 404 post not found, 409 duplicate
        showMessage(data.message || "Unable to update blog post.", "error");
        return;
      }

      currentPost = data.post;
      showMessage(data.message || "Blog post updated successfully.", "success");

      // Show the updated post in the detail view
      document.getElementById("detail-title").textContent = currentPost.title;
      document.getElementById("detail-content").textContent = currentPost.content;

      // Refresh the homepage list (loadPosts is defined in view-posts.js)
      if (typeof loadPosts === "function") {
        loadPosts();
      }

      setTimeout(showDetailView, 1000);
    } catch (err) {
      showMessage("Unable to connect to the server. Please try again.", "error");
    } finally {
      submitBtn.disabled = false;
    }
  });

  cancelBtn.addEventListener("click", showDetailView);
  backBtn.addEventListener("click", showDetailView);

  // Hide the update form if the user navigates elsewhere
  ["nav-home", "home-link", "create-post-btn"].forEach((id) => {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener("click", () => {
        updateView.classList.add("hidden");
        clearMessage();
      });
    }
  });
})();