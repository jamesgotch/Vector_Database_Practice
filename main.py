import chromadb
from fastapi import FastAPI

from fastapi.staticfiles import StaticFiles

app = FastAPI()

db = chromadb.Client()

collection = db.create_collection(name="documents")

collection.add(
    ids = [
        "doc1",
        "doc2",
        "doc3",
        "doc4",
        "doc5",
        "doc6",
        "doc7",
        "doc8",
        "doc9",
        "doc10",
        "doc11",
        "doc12",
        "doc13",
        "doc14",
        "doc15"
    ],
    documents = [
        # Animals
        "The cat curled up on the warm windowsill and fell asleep.",
        "A golden retriever fetched the ball from the lake.",
        "Dolphins are known to be among the most intelligent animals.",
        # Food & cooking
        "She simmered the tomato sauce for three hours.",
        "The bakery on Main Street makes the best sourdough bread.",
        "Coffee beans are roasted at temperatures above 400 degrees.",
        # Space
        "The James Webb telescope captured images of distant galaxies.",
        "Astronauts on the space station experience 16 sunrises per day.",
        "Mars has the largest volcano in the solar system, Olympus Mons.",
        # Music
        "The guitarist played a twelve-bar blues solo in the key of E.",
        "Beethoven composed his Ninth Symphony while almost completely deaf.",
        "The drummer kept a steady rhythm through the entire jazz set.",
        # Technology
        "Python is one of the most popular programming languages today.",
        "The new chip has 80 billion transistors packed into a single die.",
        "Self-driving cars use lidar sensors to map their surroundings.",
    ]
)

@app.get("/documents")
def get_documents():
    results = collection.get()
    documents = []
    for i in range(15):
        dictionary = {
            "id": results["ids"][i],
            "document": results["documents"][i]
        }
        documents.append(dictionary)
    return documents

@app.get("/search")
def search_documents(query: str):
    results = collection.query(query_texts = [query],n_results = 5)
    documents = []
    for i in range(5):
        dictionary = {
            "id": results["ids"][0][i],
            "document": results["documents"][0][i],
            "distance": results["distances"][0][i]
        }
        documents.append(dictionary)
    return documents
    

app.mount("/", StaticFiles(directory="static", html=True), name="static")