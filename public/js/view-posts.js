
const postsContainer = document.getElementById("posts-container");
const postsMessage = document.getElementById("posts-message");

const homeView = document.getElementById("home-view");
const postDetailView = document.getElementById("post-detail-view");

let allPosts = [];
let selectedPostId = null;

// Format ISO date into a readable date
function formatDate(dateString) {
  if (!dateString) return "Unknown date";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return date.toLocaleDateString("en-SG", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

// Shorten long blog content for previews
function getPreview(content, maxLength = 140) {
  if (content.length <= maxLength) {
    return content;
  }

  return content.substring(0, maxLength).trimEnd() + "...";
}

// Create one blog card
function createBlogCard(post) {
  const card = document.createElement("article");
  card.className = "blog-card";

  const cover = document.createElement("div");
  cover.className = "blog-cover";
  cover.textContent = "CB";

  const cardContent = document.createElement("div");
  cardContent.className = "blog-card-content";

  const category = document.createElement("span");
  category.className = "category-label";
  category.textContent = "Community Blog";

  const title = document.createElement("h2");
  title.textContent = post.title;

  const meta = document.createElement("div");
  meta.className = "post-meta";

  const author = document.createElement("span");
  author.textContent = "By " + post.author;

  const separator = document.createElement("span");
  separator.textContent = "•";

  const date = document.createElement("span");
  date.textContent = formatDate(post.createdAt);

  meta.append(author, separator, date);

  const preview = document.createElement("p");
  preview.className = "blog-preview";
  preview.textContent = getPreview(post.content);

  const viewButton = document.createElement("button");
  viewButton.type = "button";
  viewButton.className = "view-post-btn";
  viewButton.textContent = "Read More →";

  viewButton.addEventListener("click", () => {
    showPostDetails(post.postId);
  });

  cardContent.append(
    category,
    title,
    meta,
    preview,
    viewButton
  );

  card.append(cover, cardContent);

  return card;
}

// Fetch all posts from Express
async function loadPosts() {
  postsMessage.textContent = "Loading blog posts...";
  postsMessage.classList.remove("hidden");

  try {
    const response = await fetch("/posts");

    if (!response.ok) {
      throw new Error("Failed to retrieve posts");
    }

    const posts = await response.json();

    if (!Array.isArray(posts)) {
      throw new Error("Invalid posts data");
    }

    allPosts = posts.sort((a, b) => {
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    displayPosts();

  } catch (error) {
    console.error("Error loading posts:", error);

    postsContainer.replaceChildren();
    postsMessage.textContent =
      "Unable to load blog posts. Please try again later.";
  }
}

// Display recent posts on the homepage
function displayPosts() {
  postsContainer.replaceChildren();

  if (allPosts.length === 0) {
    postsMessage.textContent = "No blog posts available yet.";
    postsMessage.classList.remove("hidden");
    return;
  }

  postsMessage.classList.add("hidden");

  allPosts.forEach((post) => {
    const card = createBlogCard(post);
    postsContainer.appendChild(card);
  });
}

// Display selected post
function showPostDetails(postId) {
  const post = allPosts.find((item) => item.postId === postId);

  if (!post) {
    alert("Blog post not found.");
    return;
  }

  selectedPostId = post.postId;

  document.getElementById("detail-title").textContent = post.title;
  document.getElementById("detail-author").textContent = "By " + post.author;
  document.getElementById("detail-date").textContent =
    formatDate(post.createdAt);

  document.getElementById("detail-content").textContent = post.content;
  document.getElementById("detail-cover").textContent = "CB";

  homeView.classList.add("hidden");
  postDetailView.classList.remove("hidden");

  window.scrollTo(0, 0);
}

// Return to homepage
function showHome() {
  selectedPostId = null;

  postDetailView.classList.add("hidden");
  homeView.classList.remove("hidden");

  window.scrollTo(0, 0);
}

// Navigation
document.getElementById("back-btn").addEventListener("click", showHome);

document.getElementById("nav-home").addEventListener("click", showHome);

document.getElementById("create-post-btn").addEventListener("click", () => {
  document.getElementById("home-view").classList.add("hidden");
  document.getElementById("post-detail-view").classList.add("hidden");
  document.getElementById("create-post-view").classList.remove("hidden");

  window.scrollTo(0, 0);
});

// Placeholder for Thiha's Update Post feature
document.getElementById("update-post-btn").addEventListener("click", () => {
  alert("Update Post feature will be implemented soon.");
});

// Placeholder for Moses's Delete Post feature
document.getElementById("delete-post-btn").addEventListener("click", () => {
  alert("Delete Post feature will be implemented soon.");
});

// Load posts when the page opens
loadPosts();
