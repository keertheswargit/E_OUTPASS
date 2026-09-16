from pymongo import MongoClient

MONGO_URI = "mongodb://localhost:27017"

client = MongoClient(MONGO_URI)

db = client["eoutpass"]

outpasses_collection = db["outpasses"]
notifications_collection = db["notifications"]