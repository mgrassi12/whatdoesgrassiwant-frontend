const DEFAULT_IMAGE_URL =
  "https://upload.wikimedia.org/wikipedia/commons/0/04/Prezenty_EXP_096_%28ubt%29.JPG";

const wishlistContainer = document.getElementById("wishlist");
const emptyMessage = document.getElementById("empty-message");
const sortSelect = document.getElementById("sort-select");
const lastUpdatedLabel = document.getElementById("last-updated");
const itemCountLabel = document.getElementById("item-count-label");
const API_URL = "https://func-whatdoesgrassiwant-api.azurewebsites.net/api/wishlist";

let currentSort = sortSelect.value;
let items = [];

function formatDate(dateString) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

function sortItems() {
  const sorted = [...items];
  sorted.sort((a, b) => {
    if (currentSort === "price-asc") {
      return a.price_in_aud - b.price_in_aud;
    }
    if (currentSort === "price-desc") {
      return b.price_in_aud - a.price_in_aud;
    }

    const da = new Date(a.dateAdded).getTime();
    const db = new Date(b.dateAdded).getTime();

    if (currentSort === "date-asc") {
      return da - db;
    }

    // default - newest first
    return db - da;
  });
  return sorted;
}

function renderItems() {
  wishlistContainer.innerHTML = "";

  const sorted = sortItems();

  if (!sorted.length) {
    emptyMessage.style.display = "block";
    return;
  }

  emptyMessage.style.display = "none";

  sorted.forEach((item) => {
    const card = document.createElement("article");
    card.className = "item-card";

    const imageUrl =
      item.imageUrl && item.imageUrl.trim().length > 0
        ? item.imageUrl
        : DEFAULT_IMAGE_URL;

    card.innerHTML = `
      <div class="item-image-wrapper">
        <img
          src="${imageUrl}"
          alt="${item.name}"
          class="item-image"
          loading="lazy"
        />
      </div>
      <div class="item-content">
        <div class="item-header">
          <h2 class="item-title">${item.name}</h2>
          <div class="price-chip">
            <span>$${item.price_in_aud}</span>
          </div>
        </div>
        <p class="item-body">${item.description}</p>
        <div class="item-meta">
          <div class="meta-left">
            <span class="meta-pill">Date added: ${formatDate(item.dateAdded)}</span>
          </div>
        </div>
        <div class="item-actions">
          <a
            href="${item.url}"
            target="_blank"
            rel="noopener noreferrer"
            class="link-btn"
          >
            <span class="icon">↗</span>
            <span>View item</span>
          </a>
        </div>
      </div>
    `;

    wishlistContainer.appendChild(card);
  });
}

function updateMeta() {
  const count = items.length;
  itemCountLabel.textContent =
    count === 1 ? "1 item on the wishlist" : `${count} items on the wishlist`;

  const latest = items
    .map((i) => new Date(i.dateAdded).getTime())
    .filter((t) => !Number.isNaN(t))
    .sort((a, b) => b - a)[0];

  if (latest) {
    const d = new Date(latest);
    lastUpdatedLabel.textContent =
      "Last updated " +
      d.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric"
      });
  } else {
    lastUpdatedLabel.textContent = "";
  }
}

function attachListeners() {
  sortSelect.addEventListener("change", () => {
    currentSort = sortSelect.value;
    renderItems();
  });
}

async function loadWishlist() {
  try {
    // uncomment the line below for testing locally
    // const response = await fetch("wishlist-example.json");
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    const data = await response.json();
    items = Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("Failed to load wishlist data", err);
    items = [];
  }

  updateMeta();
  renderItems();
}

function init() {
  attachListeners();
  loadWishlist();
}

window.addEventListener("DOMContentLoaded", init);
