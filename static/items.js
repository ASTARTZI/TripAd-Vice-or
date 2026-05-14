// Βασικό URL του Flask REST API
const API_BASE_URL = "http://127.0.0.1:5000";


// Δημιουργία των καρτών
// Παίρνει ένα αντικείμενο item (από το MongoDB) και επιστρέφει δυναμικά html
function createCard(item) {

    if (!item._id) {
        return "";
    } // Στην περίπτωση που υπάρχει invalid αντικείμενο, δλδ χωρίς id,δεν δημιουργείται κάρτα
    
    //δημιουργεί την κάρτα με την εικόνα το όνομα, την περιγραφή,την κατηγορία και το επίπεδο ρίσκου για την συνήθεια
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
//Με το onclick ="likeItem('${item._id}')":
//όταν ο χρήστης πατήσει στην εικόνα γίνεται POST request στο /like!!!

//αν δεν υπάρχει κάποιο από τα χαρακτηριστικά εμφανίζουμε unknown ή not specified για να υπάρχει ομοιομορφία


//***************************************************************

//Η βασική function για αναζήτηση μιας κακής συνήθειας
async function loadItems(searchTerm = "") {

    const container = document.getElementById("items-container");
    //βρίσκει στο html το element που έχει id="items-container" και το βάζει στο container

    //για να αποφευχθεί πρόβλημα σε περίπτωση που δεν υπάρχει το element στη σελίδα
    if (!container) {
        return;
    }

    //παίρνουμε το dropdown categories απο το items.html
    const categoryFilter = document.getElementById("category-filter");

    //αν υπάρχει το categoryFilter τότε το category παίρνει την τιμή του, αλλιώς είναι κενό
    const category = categoryFilter
        ? categoryFilter.value
        : "";

    try {
        //Εμφανίζει loading state πριν ολοκληρωθεί το fetch
        container.innerHTML = "<p>Loading bad habits...</p>";

        // Δημιουργία URL για το search endpoint
        // με ασφαλές encoding
        let url =
            `${API_BASE_URL}/search?name=${encodeURIComponent(searchTerm)}`;

        //Αν υπάρχει category, προστίθεται στο URL 
        if (category !== "") {
            url += `&category=${encodeURIComponent(category)}`;
        }

        //GET request στο Flask API
        const response = await fetch(url);

        //Μετατροπή JSON response σε JavaScript Array
        const items = await response.json();

        //Καθαρίζει προηγούμενα αποτελέσματα
        container.innerHTML = "";

        //Αν δεν βρέθηκαν αποτελέσματα εμφανίζει το παρακάτω
        if (!items || items.length === 0) {

            container.innerHTML =
                "<p>No bad habits found.</p>";

            return;
        }

        //δημιουργία καρτών για όλα τα items
        container.innerHTML =
            items.map(createCard).join("");

    } catch (error) {
        // Εμφάνιση error στο console
        console.error("Error loading items:", error);

        container.innerHTML =
            "<p>Error loading items.</p>";
    }
}

//***************************************************************
//Βασική συνάρτηση για το like 
//Κάνει like σε ένα bad habit
async function likeItem(itemId) {

    try {
        //POST request στο /like endpoint
        const response = await fetch(`${API_BASE_URL}/like`, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            //Στέλνει το id του item σε μορφή JSON
            body: JSON.stringify({
                id: itemId
            })
        });

        //Παίρνει το updated item
        const updatedItem = await response.json();

        //Αν υπάρχει error εμφανίζεται στο console
        if (updatedItem.error) {

            console.error(updatedItem.error);

            return;
        }

        //βρίσκει το span των likes
        const likesElement =
            document.getElementById(`likes-${itemId}`);

        //Ενημερώνει δυναμικά τα likes χωρίς refresh!
        if (likesElement) {
            likesElement.textContent = updatedItem.likes;
        }

    } catch (error) {

        console.error("Error liking item:", error);
    }
}

//***************************************************************

//το τρέχον slide
let currentSlide = 0;

//Array με τα popular items
let popularItems = [];

//Ελέγχει αν το slide είναι expanded
let expandedSlide = false;

//Αποθηκεύει το interval του slideshow
let slideshowInterval = null;

//κρατάει ποιο slide είναι locked
let lockedSlideIndex = null;

//***************************************************************

//Ξεκινά το automatic slideshow
function startSlideshow() {

    //σταματάει προηγούμενο interval 
    stopSlideshow();

    //αλλάζει slide κάθε 5 δευτερόλεπτα
    slideshowInterval = setInterval(() => {

        // Αν είναι ανοιχτές οι πληροφορίες,
        // ΜΗΝ αλλάζεις slide
        if (expandedSlide) {
            return;
        }

        //Μεταβαίνει στο επόμενο slide
        currentSlide =
            (currentSlide + 1)
            % popularItems.length; //για να "γυρίζει" κυκλικά τα slides

        //Εμφανίζει το νέο slide
        showSlide(currentSlide);

    }, 5000);
}

//***************************************************************

//Σταματάει το sldeshow
function stopSlideshow() {

    //Αν υπάρχει ενεργό interval
    if (slideshowInterval !== null) {

        clearInterval(slideshowInterval);

        slideshowInterval = null;
    }
}

//***************************************************************

//Φορτώνει τα τοπ 5 popular items
async function loadPopularItems() {

    //Παίρνει το slideshow container
    const container =
        document.getElementById("popular-container");

    //Αν δεν υπάρχει το container σταματάει η function
    if (!container) {
        return;
    }

    try {

        //Μήνυμα Loading
        container.innerHTML =
            "<p>Loading popular bad habits...</p>";

        //GET request στο /popular endpoint
        const response =
            await fetch(`${API_BASE_URL}/popular`);

        //Μετατροπή του response σε array
        popularItems = await response.json();

        container.innerHTML = "";

        //Αν δεν υπάρχουν τέτοια items 
        if (!popularItems || popularItems.length === 0) {

            container.innerHTML =
                "<p>No popular bad habits found.</p>";

            return;
        }

        //Reset slideshow variables
        currentSlide = 0;

        expandedSlide = false;

        lockedSlideIndex = null;

        showSlide(currentSlide);

        startSlideshow();

        const prevButton =
            document.getElementById("prev-slide");

        const nextButton =
            document.getElementById("next-slide");

        if (prevButton) {

            prevButton.onclick = () => {

                expandedSlide = false;

                lockedSlideIndex = null;

                currentSlide =
                    (currentSlide - 1 + popularItems.length)
                    % popularItems.length;

                showSlide(currentSlide);

                startSlideshow();
            };
        }

        if (nextButton) {

            nextButton.onclick = () => {

                expandedSlide = false;

                lockedSlideIndex = null;

                currentSlide =
                    (currentSlide + 1)
                    % popularItems.length;

                showSlide(currentSlide);

                startSlideshow();
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
}

//***************************************************************

//Εμφανίζει ένα συγκεκριμένο slide
function showSlide(index) {

    const container =
        document.getElementById("popular-container");

    //Αν δεν υπάρχει container ή items
    if (!container || popularItems.length === 0) {
        return;
    }

    //Aν το slide είναι expanded, δεν επιτρέπεται η αλλαγή slide!
    if (
        expandedSlide &&
        lockedSlideIndex !== null &&
        index !== lockedSlideIndex
    ) {

        currentSlide = lockedSlideIndex;

        return;
    }

    //Παίρνει το item του current slide
    const item = popularItems[index];

    //Δημιουργεί δυναμικά το slide
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

//***************************************************************

//Ανοίγει η κλείνει τις εξτρα πληροφορίες
function toggleSlideDetails() {

    expandedSlide = !expandedSlide;

    //Ανοίγμα πληροφοριών

    //Αν ανοίξουν οι πληροφορίες
    if (expandedSlide) {
        //κλειδώνει το τρέχον slide 
        lockedSlideIndex = currentSlide;

        //σταματά το αυτόματο slideshow
        stopSlideshow();

    } else {

        //Κλείσιμο πληροφοριών 

        //Επιστρέφει στο locked slide 
        currentSlide = lockedSlideIndex;

        lockedSlideIndex = null;

        showSlide(currentSlide);

        //Ξαναξεκινά το slideshow
        startSlideshow();

        return;
    }
    //ενημερώνει το slide
    showSlide(currentSlide);
}

//***************************************************************

//Εκτελείται όταν φορτωσει πλήρως το HTML
document.addEventListener("DOMContentLoaded", () => {

    //Παίρνει τα στοιχεία του search
    const searchButton =
        document.getElementById("search-button");

    const searchInput =
        document.getElementById("search-input");

    const categoryFilter =
        document.getElementById("category-filter");

    //Items page

    //Αν υπάρχουν τα στοιχεία search
    if (searchButton && searchInput) {
        //φορτώνει αρχικά όλα τα items
        loadItems();

        //Search button click
        searchButton.addEventListener("click", () => {

            loadItems(searchInput.value);
        });

        //search με enter key
        searchInput.addEventListener("keyup", (event) => {

            if (event.key === "Enter") {

                loadItems(searchInput.value);
            }
        });

        //Filter ανά category
        if (categoryFilter) {

            categoryFilter.addEventListener("change", () => {

                loadItems(searchInput.value);
            });
        }
    }

    //homepage slideshow

    //φορτώνει τα popular items
    loadPopularItems();
});