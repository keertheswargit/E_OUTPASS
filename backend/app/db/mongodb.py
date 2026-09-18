<<<<<<< HEAD
import os
from pymongo import MongoClient

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")

try:
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=500)
    client.admin.command("ping")
    db = client["eoutpass"]
    outpasses_collection = db["outpasses"]
    notifications_collection = db["notifications"]
except Exception:
    try:
        import mongomock
        client = mongomock.MongoClient()
        db = client["eoutpass"]
        outpasses_collection = db["outpasses"]
        notifications_collection = db["notifications"]
    except ImportError:
        client = None
        db = None
        outpasses_collection = None
        notifications_collection = None

__all__ = ["client", "db", "outpasses_collection", "notifications_collection"]
=======
from pymongo import MongoClient

MONGO_URI = "mongodb://localhost:27017"

client = MongoClient(MONGO_URI)

db = client["eoutpass"]

outpasses_collection = db["outpasses"]
>>>>>>> c860b4b89ef3f0e0294ea04ddbc8d2ffafcbfb17
