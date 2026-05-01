from langchain_text_splitters import RecursiveCharacterTextSplitter

with open("sample.txt") as f:
    text = f.read()

RecursiveCharacterTextSplitter(
    chunk_size = 200,
    chunk_overlap = 20
)

result = splitter.split_text(text)

print(result)
