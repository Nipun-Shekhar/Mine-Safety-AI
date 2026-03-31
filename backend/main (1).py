import asyncio
import io
import os
import json
import sqlite3
import requests
from bs4 import BeautifulSoup
from datetime import datetime

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas

# -------------------------------------------------------
# LAZY IMPORT of RAG model (IMPORTANT)
# -------------------------------------------------------
agent = None

async def load_agent():
    """
    Load the RAG agent lazily in a background thread.
    This avoids heavy imports at startup (HuggingFace requirement).
    """
    global agent
    if agent is None:
        print("🔄 Loading RAG agent...")
        from agent1 import ask  # import inside function
        agent = ask
        print("✅ RAG agent ready.")


# -------------------------------------------------------
# FastAPI Setup
# -------------------------------------------------------
app = FastAPI(title="Digital Mine Safety Officer")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

print("🚀 FastAPI imported — server starting instantly...")


# -------------------------------------------------------
# In-Memory L1 Cache
# -------------------------------------------------------
L1_CACHE_SIZE = 100
lru_cache_store = {}

def get_from_l1(query):
    return lru_cache_store.get(query)

def set_to_l1(query, response):
    if len(lru_cache_store) >= L1_CACHE_SIZE:
        oldest_key = next(iter(lru_cache_store))
        lru_cache_store.pop(oldest_key)
    lru_cache_store[query] = response


# -------------------------------------------------------
# SQLite L2 Cache
# -------------------------------------------------------
DB_PATH = os.getenv("DB_PATH", "rag_cache.db")
conn = sqlite3.connect(DB_PATH, check_same_thread=False)
cursor = conn.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS cache (
    query TEXT PRIMARY KEY,
    response TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
)
""")
conn.commit()


def get_from_l2(query):
    cursor.execute("SELECT response FROM cache WHERE query = ?", (query,))
    row = cursor.fetchone()
    return row[0] if row else None


def set_to_l2(query, response):
    cursor.execute(
        "INSERT OR REPLACE INTO cache (query, response, timestamp) VALUES (?, ?, CURRENT_TIMESTAMP)",
        (query, response)
    )
    conn.commit()


# -------------------------------------------------------
# Cached Ask Function (loads model lazily)
# -------------------------------------------------------
async def cached_ask(query: str):
    # Lazy load the RAG model when needed
    await load_agent()

    # Check L1 cache
    result = get_from_l1(query)
    if result:
        return result

    # Check L2 cache
    result = get_from_l2(query)
    if result:
        set_to_l1(query, result)
        return result

    # Compute RAG result
    result = await asyncio.to_thread(agent, query)
    result = str(result).strip()

    # Store in both caches
    set_to_l1(query, result)
    set_to_l2(query, result)

    return result


# -------------------------------------------------------
# QUERY ENDPOINT
# -------------------------------------------------------
@app.post("/query")
async def query_agent(request: Request):
    data = await request.json()
    query = data.get("query", "")
    if not query:
        return {"response": "⚠️ Query is empty."}

    response = await cached_ask(query)
    return {"response": response}


# -------------------------------------------------------
# DGMS Updates Endpoint
# -------------------------------------------------------
from rss_feed import fetch_dgms_updates

@app.get("/updates")
async def get_dgms_updates():
    updates = fetch_dgms_updates(limit=5)

    async def analyze_update(item):
        title = item.get("title", "")
        link = item.get("link", "")
        published = item.get("published", "")

        try:
            response = await asyncio.to_thread(requests.get, link, timeout=10)
            soup = BeautifulSoup(response.text, "html.parser")
            paragraphs = [p.get_text() for p in soup.find_all("p")]
            content = " ".join(paragraphs[:5]) if paragraphs else "(No text found.)"
        except Exception:
            content = "(Could not fetch full article text.)"

        prompt = (
            f"You are a mining safety officer. Analyze the following DGMS update "
            f"and classify the risk level (High, Medium, Low, or None), and describe "
            f"the hazard type.\n\n"
            f"Title: {title}\nPublished: {published}\nLink: {link}\n"
            f"Content: {content}"
        )

        try:
            output = await cached_ask(prompt)
        except Exception as e:
            output = f"⚠️ Error: {e}"

        return {
            "title": title,
            "link": link,
            "published": published,
            "danger_analysis": output,
        }

    analyzed_updates = await asyncio.gather(*[analyze_update(u) for u in updates])
    return {"updates": analyzed_updates}


# -------------------------------------------------------
# PDF Audit Report Endpoint
# -------------------------------------------------------
@app.post("/audit_report_pdf")
async def generate_audit_report_pdf(request: Request):
    data = await request.json()
    state = data.get("state", "All States")
    year = data.get("year", "All Years")
    hazard_type = data.get("hazard_type", "All Hazards")

    prompt = (
        f"You are a mining safety audit assistant. Using the DGMS mining accident data, "
        f"generate a detailed safety audit report for:\n\n"
        f"State: {state}\nYear: {year}\nHazard Type: {hazard_type}\n\n"
        f"Provide insights on:\n"
        f"- Number of incidents\n"
        f"- Categories (gas leak, collapse, fire, machinery, etc.)\n"
        f"- Severity distribution\n"
        f"- Root causes\n"
        f"- Safety recommendations\n"
        f"- Trends\n"
        f"Return plain text."
    )

    report_text = await cached_ask(prompt)

    # PDF creation
    pdf_buffer = io.BytesIO()
    c = canvas.Canvas(pdf_buffer, pagesize=A4)
    width, height = A4

    c.setFont("Helvetica-Bold", 16)
    c.drawString(50, height - 50, "🦺 Mining Safety Audit Report")

    c.setFont("Helvetica", 12)
    c.drawString(50, height - 80, f"State: {state}")
    c.drawString(50, height - 100, f"Year: {year}")
    c.drawString(50, height - 120, f"Hazard Type: {hazard_type}")

    y = height - 160
    c.setFont("Helvetica", 11)

    for line in report_text.splitlines():
        while len(line) > 90:
            part = line[:90]
            c.drawString(60, y, part)
            y -= 15
            line = line[90:]
        c.drawString(60, y, line)
        y -= 15
        if y < 50:
            c.showPage()
            c.setFont("Helvetica", 11)
            y = height - 50

    c.save()
    pdf_buffer.seek(0)

    filename = f"Audit_Report_{state}_{year}.pdf"
    with open(filename, "wb") as f:
        f.write(pdf_buffer.getvalue())

    return FileResponse(path=filename, filename=filename, media_type="application/pdf")


# -------------------------------------------------------
# Root Endpoint
# -------------------------------------------------------
@app.get("/")
async def root():
    return {"message": "🦺 Digital Mine Safety Officer API is running!"}

