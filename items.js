const API_BASE_URL = "http://127.0.0.1:5000";

function createCard(item) {
    return `
        <div class="card">
            <img src="${item.image}" alt="${item.name}" onclick="likeItem('${item._id}')">
            <div class="card-content">
                <h3>${item.name}</h3>
                <p>${item.description}</p>
                <p><strong>Category:</strong> ${item.category || "Unknown"}</p>
                <p><strong>Risk Level:</strong> ${item.risk_level || "Unknown"}</p>
                <p><strong>Likes:</strong> ${item.likes}</p>
                <button class="like-button" onclick="likeItem('${item._id}')">Bad Idea</button>
            </div>
        </div>
    `;
}

async function loadItems(searchTerm = "") {
    const container = document.getElementById("items-container");
    if (!container) return;

    try {
        const response = await fetch(`${API_BASE_URL}/search?name=${encodeURIComponent(searchTerm)}`);
        const items = await response.json();

        container.innerHTML = "";

        if (items.length === 0) {
            container.innerHTML = "<p>No bad habits found.</p>";
            return;
        }

        items.forEach(item => {
            container.innerHTML += createCard(item);
        });
    } catch (error) {
        container.innerHTML = "<p>Error loading items.</p>";
        console.error(error);
    }
}

async function likeItem(itemId) {
    try {
        const response = await fetch(`${API_BASE_URL}/like`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ id: itemId })
        });

        await response.json();

        const searchInput = document.getElementById("search-input");
        if (searchInput) {
            loadItems(searchInput.value);
        } else {
            loadPopularItems();
        }
    } catch (error) {
        console.error("Error liking item:", error);
    }
}

async function loadPopularItems() {
    const container = document.getElementById("popular-container");
    if (!container) return;

    try {
        const response = await fetch(`${API_BASE_URL}/popular`);
        const items = await response.json();

        container.innerHTML = "";

        items.forEach(item => {
            container.innerHTML += createCard(item);
        });
    } catch (error) {
        container.innerHTML = "<p>Error loading popular items.</p>";
        console.error(error);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const searchButton = document.getElementById("search-button");
    const searchInput = document.getElementById("search-input");

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
    }

    loadPopularItems();
});