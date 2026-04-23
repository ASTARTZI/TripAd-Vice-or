from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017")
db = client["tripadvisor_db"]
items = db["items"]

items.delete_many({})

sample_data = [
    {
        "name": "Midnight Doomscrolling",
        "image": "images/doom.jpg",
        "description": "Scrolling μέχρι το πρωί",
        "likes": 0,
        "category": "Sleep Destroyers",
        "risk_level": "High",
        "side_effects": "Tiredness"
    },
    {
        "name": "Energy Drink Breakfast",
        "image": "images/energy.jpg",
        "description": "Πρωινό μόνο με energy drink",
        "likes": 0,
        "category": "Food Mistakes",
        "risk_level": "High",
        "side_effects": "Crash later"
    }
]

items.insert_many(sample_data)

print("Database seeded successfully.")