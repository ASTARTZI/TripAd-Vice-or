from flask import Flask, request, jsonify
from flask_pymongo import PyMongo
from flask_cors import CORS
from bson.objectid import ObjectId

app = Flask(__name__)

app.config["MONGO_URI"] = "mongodb://localhost:27017/tripadvisor_db"

mongo = PyMongo(app)
CORS(app)


def serialize_item(item):
    return {
        "_id": str(item["_id"]),
        "name": item.get("name", ""),
        "image": item.get("image", ""),
        "description": item.get("description", ""),
        "likes": item.get("likes", 0),
        "category": item.get("category", ""),
        "risk_level": item.get("risk_level", "")
    }


@app.route("/")
def home():
    return "TripAd-Vice-or API is running!"


@app.route("/search", methods=["GET"])
def search_items():
    name = request.args.get("name", "").strip()
    collection = mongo.db.items

    if name == "":
        results = list(collection.find())
    else:
        exact_match = list(collection.find({"name": {"$regex": f"^{name}$", "$options": "i"}}))

        if len(exact_match) > 0:
            results = exact_match
        else:
            results = list(
                collection.find(
                    {"name": {"$regex": name, "$options": "i"}}
                ).sort("likes", -1)
            )

    return jsonify([serialize_item(item) for item in results])


@app.route("/like", methods=["POST"])
def like_item():
    data = request.get_json()

    if not data or "id" not in data:
        return jsonify({"error": "Missing item id"}), 400

    item_id = data["id"]

    try:
        result = mongo.db.items.update_one(
            {"_id": ObjectId(item_id)},
            {"$inc": {"likes": 1}}
        )

        if result.matched_count == 0:
            return jsonify({"error": "Item not found"}), 404

        updated_item = mongo.db.items.find_one({"_id": ObjectId(item_id)})
        return jsonify(serialize_item(updated_item))

    except Exception:
        return jsonify({"error": "Invalid item id"}), 400


@app.route("/popular", methods=["GET"])
def popular_items():
    results = list(
        mongo.db.items.find().sort("likes", -1).limit(5)
    )
    return jsonify([serialize_item(item) for item in results])


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)