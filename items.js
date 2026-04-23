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
    console.log("loadItems called");
    console.log("Container found:", container);
    console.log("Search term:", searchTerm);

    if (!container) {
        console.log("items-container was not found in HTML");
        return;
    }

    try {
        const url = `${API_BASE_URL}/search?name=${encodeURIComponent(searchTerm)}`;
        console.log("Fetching from:", url);

        const response = await fetch(url);
        console.log("Response status:", response.status);

        const items = await response.json();
        console.log("Items from API:", items);

        container.innerHTML = "";

        if (items.length === 0) {
            container.innerHTML = "<p>No bad habits found.</p>";
            return;
        }

        items.forEach(item => {
            container.innerHTML += createCard(item);
        });
    } catch (error) {
        console.error("Error inside loadItems:", error);
        container.innerHTML = "<p>Error loading items.</p>";
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
        }
    } catch (error) {
        console.error("Error liking item:", error);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM fully loaded");

    const searchButton = document.getElementById("search-button");
    const searchInput = document.getElementById("search-input");

    console.log("Search button:", searchButton);
    console.log("Search input:", searchInput);

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
    } else {
        console.log("Search button or input not found");
    }
});