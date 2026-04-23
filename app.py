from flask import Flask, request, jsonify
from flask_pymongo import PyMongo
from flask_cors import CORS
from bson.objectid import ObjectId

app = Flask(__name__)
CORS(app)

app.config["MONGO_URI"] = "mongodb://localhost:27017/tripadvisor_db"
mongo = PyMongo(app)


def serialize_item(item):
    return {
        "_id": str(item["_id"]),
        "name": item.get("name", ""),
        "image": item.get("image", ""),
        "description": item.get("description", ""),
        "likes": item.get("likes", 0),
        "category": item.get("category", ""),
        "risk_level": item.get("risk_level", ""),
        "side_effects": item.get("side_effects", "")
    }


@app.route("/")
def home():
    return "TripAd-Vice-or API is running!"


@app.route("/search", methods=["GET"])
def search():
    name = request.args.get("name", "").strip()

    if name == "":
        results = list(mongo.db.items.find().sort("likes", -1))
    else:
        exact_match = list(mongo.db.items.find({
            "name": {"$regex": f"^{name}$", "$options": "i"}
        }))

        if exact_match:
            results = exact_match
        else:
            results = list(mongo.db.items.find({
                "name": {"$regex": name, "$options": "i"}
            }).sort("likes", -1))

    serialized_results = [serialize_item(item) for item in results]
    return jsonify(serialized_results)


@app.route("/like", methods=["POST"])
def like_item():
    data = request.get_json()

    if not data or "id" not in data:
        return jsonify({"error": "Missing item id"}), 400

    item_id = data["id"]

    try:
        mongo.db.items.update_one(
            {"_id": ObjectId(item_id)},
            {"$inc": {"likes": 1}}
        )

        updated_item = mongo.db.items.find_one({"_id": ObjectId(item_id)})

        if updated_item is None:
            return jsonify({"error": "Item not found"}), 404

        return jsonify(serialize_item(updated_item))

    except Exception:
        return jsonify({"error": "Invalid item id"}), 400


@app.route("/popular", methods=["GET"])
def popular_items():
    results = list(mongo.db.items.find().sort("likes", -1).limit(5))
    serialized_results = [serialize_item(item) for item in results]
    return jsonify(serialized_results)


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)