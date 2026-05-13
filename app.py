from flask import Flask, request, jsonify, render_template  # Εισαγωγή Flask εργαλείων
from flask_pymongo import PyMongo  # Σύνδεση με MongoDB
from flask_cors import CORS  # Υποστήριξη CORS
from bson.objectid import ObjectId  # Χρήση ObjectId της MongoDB

app = Flask(__name__)  # Δημιουργία Flask εφαρμογής

CORS(app)  # Ενεργοποίηση CORS

# Σύνδεση με τη βάση MongoDB
app.config["MONGO_URI"] = "mongodb://localhost:27017/tripadvisor_db"

mongo = PyMongo(app)  # Δημιουργία MongoDB instance


# Μετατροπή αντικειμένου MongoDB σε JSON format
def serialize_item(item):

    return {

        "_id": str(item["_id"]),  # Μετατροπή ObjectId σε string

        "name": item.get("name", ""),  # Όνομα habit

        "image": item.get("image", ""),  # Εικόνα

        "description": item.get("description", ""),  # Περιγραφή

        "likes": item.get("likes", 0),  # Likes

        "category": item.get("category", ""),  # Κατηγορία

        "risk_level": item.get("risk_level", ""),  # Επίπεδο κινδύνου

        "side_effects": item.get("side_effects", "")  # Παρενέργειες

    }


@app.route("/")  # Route αρχικής σελίδας
def home():

    return render_template('homepage.html')  # Εμφάνιση homepage

    return "TripAd-Vice-or API is running!"  # Δεν εκτελείται ποτέ


@app.route('/items')  # Route σελίδας items
def items():

    return render_template('items.html')  # Εμφάνιση items page


@app.route("/search", methods=["GET"])  # API αναζήτησης
def search():
    
    name = request.args.get("name", "").strip()  # Παίρνει το όνομα από τα query params

    category = request.args.get("category", "").strip()  # Παίρνει την κατηγορία από τα query params

    query = {}  # Query για MongoDB

    # Αναζήτηση με βάση το όνομα
    if name != "":

        query["name"] = {"$regex": name, "$options": "i"}

    # Φιλτράρισμα με βάση την κατηγορία
    if category != "":

        query["category"] = category

    results = list(mongo.db.items.find(query).sort("likes", -1))  # Εύρεση αποτελεσμάτων ταξινομημένα κατά likes

    serialized_results = [serialize_item(item) for item in results]  # Μετατροπή αποτελεσμάτων σε JSON format

    return jsonify(serialized_results)  # Επιστροφή JSON

@app.route("/like", methods=["POST"])  # API για like
def like_item():

    data = request.get_json()  # Παίρνει τα δεδομένα JSON

    # Έλεγχος αν υπάρχει id
    if not data or "id" not in data:

        return jsonify({"error": "Missing item id"}), 400

    item_id = data["id"]  # Αποθήκευση id

    try:

        # Αυξάνει τα likes κατά 1
        mongo.db.items.update_one(

            {"_id": ObjectId(item_id)},

            {"$inc": {"likes": 1}}
        )

        updated_item = mongo.db.items.find_one({"_id": ObjectId(item_id)})  # Βρίσκει το ενημερωμένο item

        # Έλεγχος αν υπάρχει το item
        if updated_item is None:

            return jsonify({"error": "Item not found"}), 404

        return jsonify(serialize_item(updated_item))  # Επιστροφή ενημερωμένου item

    except Exception:

        return jsonify({"error": "Invalid item id"}), 400


@app.route("/popular", methods=["GET"])  # API δημοφιλών items
def popular_items():

    results = list(mongo.db.items.find().sort("likes", -1).limit(5))  # Επιστρέφει τα 5 items με τα περισσότερα likes

    serialized_results = [serialize_item(item) for item in results]  # Μετατροπή σε JSON format

    return jsonify(serialized_results)

# Εκκίνηση εφαρμογής
if __name__ == "__main__":

    app.run(host="127.0.0.1", port=5000, debug=True)  # Τρέχει local server