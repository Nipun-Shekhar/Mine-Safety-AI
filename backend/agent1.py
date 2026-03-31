import os
import pathlib
import faiss
import numpy as np
import google.generativeai as genai
from sentence_transformers import SentenceTransformer, CrossEncoder
from dotenv import load_dotenv
import pickle
import math
import re

# ---------------------------
# Setup
# ---------------------------
BASE_DIR = pathlib.Path(__file__).resolve().parent
VECTORSTORE_PATH = BASE_DIR / "vectorstore"
load_dotenv()

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    raise ValueError("❌ Missing GOOGLE_API_KEY")

genai.configure(api_key=GOOGLE_API_KEY)

# ---------------------------
# Models
# ---------------------------
embed_model = SentenceTransformer("all-MiniLM-L6-v2")
reranker = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2")

# ---------------------------
# Load FAISS index + metadata
# ---------------------------
faiss_index_path = VECTORSTORE_PATH / "index.faiss"
faiss_meta_path = VECTORSTORE_PATH / "index.pkl"

if not faiss_index_path.exists():
    raise FileNotFoundError("❌ FAISS index not found.")

index = faiss.read_index(str(faiss_index_path))

with open(faiss_meta_path, "rb") as f:
    meta = pickle.load(f)

documents = None

if isinstance(meta, list):
    documents = meta
elif isinstance(meta, tuple):
    for item in meta:
        if isinstance(item, list):
            documents = item
        if isinstance(item, dict) and "documents" in item:
            documents = item["documents"]
elif isinstance(meta, dict):
    documents = meta.get("documents")

if documents is None:
    raise TypeError("❌ Could not locate documents in index.pkl")

print(f"✅ Loaded {len(documents)} documents")

# ---------------------------
# Utilities
# ---------------------------
def embed(text: str):
    return np.array(embed_model.encode([text]), dtype=np.float32)

def sigmoid(x):
    return 1 / (1 + math.exp(-x))

def clean_text(text: str) -> str:
    text = text.replace("#", "")
    text = re.sub(r"\n+", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()

# ---------------------------
# FAISS + Re-ranking
# ---------------------------
def search_faiss_reranked(query: str, k=5, fetch_k=15):
    q_emb = embed(query)
    _, indices = index.search(q_emb, fetch_k)

    candidates = [documents[i] for i in indices[0] if i != -1]
    if not candidates:
        return [], []

    pairs = [(query, doc) for doc in candidates]
    raw_scores = reranker.predict(pairs)

    ranked = sorted(
        zip(candidates, raw_scores),
        key=lambda x: x[1],
        reverse=True
    )

    top_docs = [doc for doc, _ in ranked[:k]]
    top_scores = [sigmoid(float(score)) for _, score in ranked[:k]]

    return top_docs, top_scores

# ---------------------------
# Confidence Score (0–1)
# ---------------------------
def compute_confidence(scores):
    if not scores:
        return 0.0
    max_score = max(scores)
    avg_score = sum(scores) / len(scores)
    confidence = 0.7 * max_score + 0.3 * avg_score
    return round(confidence, 3)

# ---------------------------
# RAG Generator
# ---------------------------
def generate_answer_rag(query: str, context_docs: list):
    context = "\n\n".join(context_docs)

    prompt = f"""
You are an expert mining engineer.

Answer ONLY using the provided documents.
If the documents do not contain the answer, say so clearly.

Question:
{query}

Documents:
{context}

Answer concisely and factually.
"""

    response = genai.GenerativeModel(
        "gemini-2.5-flash"
    ).generate_content(prompt)

    return response.text

# ---------------------------
# CAG Generator (Fallback)
# ---------------------------
def generate_answer_cag(query: str):
    prompt = f"""
You are an expert mining engineer and researcher.

The knowledge base may not contain sufficient information.
Use engineering principles and reasoning carefully.

Question:
{query}

Provide a careful, assumption-aware answer.
"""

    response = genai.GenerativeModel(
        "gemini-2.5-flash"
    ).generate_content(prompt)

    return response.text

# ---------------------------
# Full Hybrid Pipeline
# ---------------------------
def ask(query: str):
    docs, scores = search_faiss_reranked(query, k=5)
    confidence = compute_confidence(scores)

    if confidence < 0.55 or not docs:
        raw_answer = generate_answer_cag(query)
    else:
        raw_answer = generate_answer_rag(query, docs)

    answer = clean_text(raw_answer)
    return {
        "answer": answer,
        "confidence": confidence
    }

# ---------------------------
# CLI
# ---------------------------
if __name__ == "__main__":
    while True:
        q = input("\n🔍 Ask me anything about mining: ")

        answer, confidence = ask(q)

        print("\n💬 Answer:")
        print(answer)

        print("\n📊 Confidence Score:", confidence)




