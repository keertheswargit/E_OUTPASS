import pymongo
from pymongo import MongoClient

MONGO_URI = "mongodb://localhost:27017"

try:
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=1500)
    # Ping to check if server is actually running
    client.admin.command('ping')
except Exception:
    import mongomock
    client = mongomock.MongoClient()

db = client["eoutpass"]

outpasses_collection = db["outpasses"]
notifications_collection = db["notifications"]

