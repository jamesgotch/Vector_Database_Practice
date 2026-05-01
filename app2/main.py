import pathlib
from fastapi.staticfiles import StaticFiles
from fastapi import FastAPI
from langchain_text_splitters import RecursiveCharacterTextSplitter

APP_DIR = pathlib.Path(__file__).parent

app = FastAPI()

with open(APP_DIR / "sample.txt") as f:
    text = f.read()

splitter = RecursiveCharacterTextSplitter(
    chunk_size = 200,
    chunk_overlap = 20
)

result = splitter.split_text(text)


@app.get("/chunk")
def get_chunk():
    chunk_list = []
    for chunk in result:
        dictionary = {
            "chunk": chunk,
            "length": len(chunk)
        }
        chunk_list.append(dictionary)
    return chunk_list


app.mount("/", StaticFiles(directory=str(APP_DIR / "static2"), html=True), name="static2")