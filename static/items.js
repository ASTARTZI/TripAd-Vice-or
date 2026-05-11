const API_BASE_URL = "http://127.0.0.1:5000";

// =========================
// CREATE CARD
// =========================

function createCard(item) {

    if (!item._id) {
        return "";
    }

    return `
        <div class="card">

            <img
                src="${item.image}"
                alt="${item.name}"
                onclick="likeItem('${item._id}')"
            >

            <div class="card-content">

                <h3>${item.name}</h3>

                <p>${item.description}</p>

                <p>
                    <strong>Category:</strong>
                    ${item.category || "Unknown"}
                </p>

                <p>
                    <strong>Risk Level:</strong>
                    ${item.risk_level || "Unknown"}
                </p>

                <p>
                    <strong>Side Effects:</strong>
                    ${item.side_effects || "Not specified"}
                </p>

                <p>
                    <strong>Likes:</strong>
                    <span id="likes-${item._id}">
                        ${item.likes}
                    </span>
                </p>

                <button
                    class="like-button"
                    onclick="likeItem('${item._id}')"
                >
                    Bad Idea
                </button>

            </div>
        </div>
    `;
}

// =========================
// LOAD ITEMS
// =========================

async function loadItems(searchTerm = "") {

    const container = document.getElementById("items-container");

    if (!container) {
        return;
    }

    const categoryFilter = document.getElementById("category-filter");

    const category = categoryFilter
        ? categoryFilter.value
        : "";

    try {

        container.innerHTML = "<p>Loading bad habits...</p>";

        let url =
            `${API_BASE_URL}/search?name=${encodeURIComponent(searchTerm)}`;

        if (category !== "") {
            url += `&category=${encodeURIComponent(category)}`;
        }

        const response = await fetch(url);

        const items = await response.json();

        container.innerHTML = "";

        if (!items || items.length === 0) {

            container.innerHTML =
                "<p>No bad habits found.</p>";

            return;
        }

        container.innerHTML =
            items.map(createCard).join("");

    } catch (error) {

        console.error("Error loading items:", error);

        container.innerHTML =
            "<p>Error loading items.</p>";
    }
}

// =========================
// LIKE ITEM
// =========================

async function likeItem(itemId) {

    try {

        const response = await fetch(`${API_BASE_URL}/like`, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                id: itemId
            })
        });

        const updatedItem = await response.json();

        if (updatedItem.error) {

            console.error(updatedItem.error);

            return;
        }

        const likesElement =
            document.getElementById(`likes-${itemId}`);

        if (likesElement) {
            likesElement.textContent = updatedItem.likes;
        }

        const searchInput =
            document.getElementById("search-input");

        if (searchInput) {

            loadItems(searchInput.value);

        } else {

            loadPopularItems();
        }

    } catch (error) {

        console.error("Error liking item:", error);
    }
}

// =========================
// SLIDESHOW VARIABLES
// =========================

let currentSlide = 0;

let popularItems = [];

let expandedSlide = false;

let slideshowInterval;

// =========================
// LOAD POPULAR ITEMS
// =========================

async function loadPopularItems() {

    const container =
        document.getElementById("popular-container");

    if (!container) {
        return;
    }

    try {

        container.innerHTML =
            "<p>Loading popular bad habits...</p>";

        const response =
            await fetch(`${API_BASE_URL}/popular`);

        popularItems = await response.json();

        container.innerHTML = "";

        if (!popularItems || popularItems.length === 0) {

            container.innerHTML =
                "<p>No popular bad habits found.</p>";

            return;
        }

        currentSlide = 0;

        expandedSlide = false;

        showSlide(currentSlide);

        const prevButton =
            document.getElementById("prev-slide");

        const nextButton =
            document.getElementById("next-slide");

        if (prevButton && nextButton) {

            prevButton.onclick = () => {

                expandedSlide = false;

                currentSlide =
                    (currentSlide - 1 + popularItems.length)
                    % popularItems.length;

                showSlide(currentSlide);
            };

            nextButton.onclick = () => {

                expandedSlide = false;

                currentSlide =
                    (currentSlide + 1)
                    % popularItems.length;

                showSlide(currentSlide);
            };
        }

    } catch (error) {

        console.error(
            "Error loading popular items:",
            error
        );

        container.innerHTML =
            "<p>Error loading popular items.</p>";
    }

    // =========================
    // FIX MULTIPLE INTERVALS
    // =========================

    if (slideshowInterval) {
        clearInterval(slideshowInterval);
    }

    if (popularItems.length > 0) {

        slideshowInterval = setInterval(() => {

            expandedSlide = false;

            currentSlide =
                (currentSlide + 1)
                % popularItems.length;

            showSlide(currentSlide);

        }, 5000);
    }
    let isPaused = false;
    let interval = setInterval(nextSlide, 5000);

    document.addEventListener("click", function (e) {
    if (e.target.closest(".card")) {
        isPaused = true;
        clearInterval(interval);
    }
});
}

// =========================
// SHOW SLIDE
// =========================

function showSlide(index) {

    const container =
        document.getElementById("popular-container");

    if (!container || popularItems.length === 0) {
        return;
    }

    const item = popularItems[index];

    container.innerHTML = `

        <div
            class="slide-card ${expandedSlide ? "expanded" : ""}"
            onclick="toggleSlideDetails()"
        >

            <img
                src="${item.image}"
                alt="${item.name}"
            >

            <div class="slide-content">

                <h3>${item.name}</h3>

                <p>${item.description}</p>

                ${
                    expandedSlide
                    ? `
                    <div class="extra-details">

                        <p>
                            <strong>Category:</strong>
                            ${item.category || "Unknown"}
                        </p>

                        <p>
                            <strong>Risk Level:</strong>
                            ${item.risk_level || "Unknown"}
                        </p>

                        <p>
                            <strong>Side Effects:</strong>
                            ${item.side_effects || "Not specified"}
                        </p>

                    </div>
                    `
                    : ""
                }

                <p>
                    <strong>Likes:</strong>

                    <span id="likes-${item._id}">
                        ${item.likes}
                    </span>
                </p>

                <button
                    class="like-button"
                    onclick="event.stopPropagation(); likeItem('${item._id}')"
                >
                    Bad Idea
                </button>

            </div>

        </div>
    `;
}

// =========================
// TOGGLE SLIDE DETAILS
// =========================

function toggleSlideDetails() {

    expandedSlide = !expandedSlide;

    showSlide(currentSlide);
}

// =========================
// DOM LOADED
// =========================

document.addEventListener("DOMContentLoaded", () => {

    const searchButton =
        document.getElementById("search-button");

    const searchInput =
        document.getElementById("search-input");

    const categoryFilter =
        document.getElementById("category-filter");

    // =========================
    // ITEMS PAGE
    // =========================

    if (searchButton && searchInput) {

        loadItems();

        searchButton.addEventListener("click", () => {

            loadItems(searchInput.value);
        });

        searchInput.addEventListener("keyup", (event) => {

            if (event.key === "Enter") {

                loadItems(searchInput.value);
            }
        });

        // OPTIONAL LIVE SEARCH
        /*
        searchInput.addEventListener("input", () => {
            loadItems(searchInput.value);
        });
        */

        if (categoryFilter) {

            categoryFilter.addEventListener("change", () => {

                loadItems(searchInput.value);
            });
        }
    }

    // =========================
    // HOMEPAGE SLIDESHOW
    // =========================

    loadPopularItems();
});