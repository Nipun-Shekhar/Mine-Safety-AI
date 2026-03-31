"""
AI Chat router — RAG-powered Mine Safety Officer using Claude API.
Injects relevant incident data as context before calling the API.
"""
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional
import json
import httpx
from collections import Counter, defaultdict
from db import get_incidents

router = APIRouter()

CLAUDE_API_URL = "https://api.anthropic.com/v1/messages"
CLAUDE_MODEL = "claude-sonnet-4-20250514"

class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]
    stream: Optional[bool] = False

def build_data_context(query: str) -> str:
    """Build a concise, relevant data context from the incident database."""
    data = get_incidents()
    total = len(data)
    casualties = sum(r["casualties"] for r in data)
    injured = sum(r["injured"] for r in data)

    year_counts = Counter(r["year"] for r in data)
    state_counts = Counter(r["state"] for r in data)
    acc_type_counts = Counter(r["accident_type"] for r in data)
    cause_counts = Counter(r["cause"] for r in data)
    severity_counts = Counter(r["severity"] for r in data)
    mine_type_counts = Counter(r["mine_type"] for r in data)

    # If query mentions a year, include year-specific data
    year_specific = ""
    for yr in range(2016, 2023):
        if str(yr) in query:
            yr_data = [r for r in data if r["year"] == yr]
            yr_acc_types = Counter(r["accident_type"] for r in yr_data)
            yr_states = Counter(r["state"] for r in yr_data)
            yr_casualties = sum(r["casualties"] for r in yr_data)
            year_specific = f"""
--- {yr} SPECIFIC DATA ---
Incidents in {yr}: {len(yr_data)}
Casualties in {yr}: {yr_casualties}
Top accident types in {yr}: {dict(yr_acc_types.most_common(5))}
Top states in {yr}: {dict(yr_states.most_common(5))}
Sample incidents from {yr}:
"""
            for r in sorted(yr_data, key=lambda x: x["casualties"], reverse=True)[:5]:
                year_specific += f"  - [{r['date']}] {r['accident_type']} at {r['mine_name']}, {r['state']}: {r['description'][:100]}... (casualties: {r['casualties']}, severity: {r['severity']})\n"
            break

    # If query mentions a state
    state_specific = ""
    for state in ["Jharkhand", "Odisha", "Chhattisgarh", "West Bengal", "Madhya Pradesh",
                   "Telangana", "Andhra Pradesh", "Rajasthan", "Karnataka", "Maharashtra"]:
        if state.lower() in query.lower():
            st_data = [r for r in data if r["state"] == state]
            st_acc_types = Counter(r["accident_type"] for r in st_data)
            st_casualties = sum(r["casualties"] for r in st_data)
            state_specific = f"""
--- {state.upper()} SPECIFIC DATA ---
Incidents in {state}: {len(st_data)}
Casualties in {state}: {st_casualties}
Accident types breakdown: {dict(st_acc_types.most_common(5))}
Recent incidents in {state}:
"""
            for r in sorted(st_data, key=lambda x: x["date"], reverse=True)[:5]:
                state_specific += f"  - [{r['date']}] {r['accident_type']} - {r['description'][:100]}... (severity: {r['severity']}, casualties: {r['casualties']})\n"
            break

    # Top 5 most critical recent incidents
    critical = sorted(
        [r for r in data if r["severity"] in ["Critical", "High"]],
        key=lambda x: (x["casualties"], x["date"]), reverse=True
    )[:5]
    critical_text = "\n".join(
        f"  - [{r['date']}] {r['accident_type']} at {r['mine_name']}, {r['state']}: {r['casualties']} killed (cause: {r['cause']})"
        for r in critical
    )

    context = f"""
=== DGMS MINING INCIDENT DATABASE (2016-2022) ===
Total incidents: {total}
Total casualties: {casualties}
Total injured: {injured}
Severity breakdown: {dict(severity_counts)}

Incidents by year: {dict(sorted(year_counts.items()))}
Top 5 states: {dict(state_counts.most_common(5))}
Accident types (all): {dict(acc_type_counts.most_common())}
Mine types: {dict(mine_type_counts.most_common())}
Top 10 root causes: {dict(cause_counts.most_common(10))}

Most critical incidents:
{critical_text}
{year_specific}
{state_specific}
"""
    return context.strip()

def build_system_prompt(data_context: str) -> str:
    return f"""You are the Mine Safety AI Officer for India's DGMS (Directorate General of Mines Safety) data platform.
You have deep expertise in Indian mining safety regulations, accident investigation, and risk mitigation.

You have access to the following real-time incident database:

{data_context}

Your responsibilities:
1. Answer questions about mining accident data with specific numbers and statistics
2. Identify patterns and trends in accident data
3. Provide actionable safety recommendations based on data insights
4. Generate risk assessments for specific states, mine types, or accident categories
5. Help safety officers understand root causes and corrective actions

Guidelines:
- Always cite specific numbers from the database
- Use clear, professional language suitable for safety officers and regulators
- When asked about trends, compare across years or categories
- Suggest preventive measures grounded in the incident data
- Format responses clearly with sections when the answer is detailed
"""

@router.post("/message")
async def chat_message(req: ChatRequest):
    """Non-streaming chat endpoint."""
    last_user_msg = next((m.content for m in reversed(req.messages) if m.role == "user"), "")
    data_context = build_data_context(last_user_msg)
    system_prompt = build_system_prompt(data_context)

    messages = [{"role": m.role, "content": m.content} for m in req.messages]

    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.post(
            CLAUDE_API_URL,
            headers={"Content-Type": "application/json"},
            json={
                "model": CLAUDE_MODEL,
                "max_tokens": 1000,
                "system": system_prompt,
                "messages": messages,
            }
        )
    result = response.json()
    content = result.get("content", [{}])[0].get("text", "Sorry, I could not process that request.")
    return {"reply": content}

@router.post("/stream")
async def chat_stream(req: ChatRequest):
    """Streaming chat endpoint — returns SSE."""
    last_user_msg = next((m.content for m in reversed(req.messages) if m.role == "user"), "")
    data_context = build_data_context(last_user_msg)
    system_prompt = build_system_prompt(data_context)
    messages = [{"role": m.role, "content": m.content} for m in req.messages]

    async def event_generator():
        async with httpx.AsyncClient(timeout=60) as client:
            async with client.stream(
                "POST",
                CLAUDE_API_URL,
                headers={"Content-Type": "application/json"},
                json={
                    "model": CLAUDE_MODEL,
                    "max_tokens": 1000,
                    "stream": True,
                    "system": system_prompt,
                    "messages": messages,
                }
            ) as response:
                async for line in response.aiter_lines():
                    if line.startswith("data: "):
                        chunk = line[6:]
                        if chunk == "[DONE]":
                            yield "data: [DONE]\n\n"
                            break
                        try:
                            parsed = json.loads(chunk)
                            if parsed.get("type") == "content_block_delta":
                                text = parsed.get("delta", {}).get("text", "")
                                if text:
                                    yield f"data: {json.dumps({'text': text})}\n\n"
                        except Exception:
                            pass
        yield "data: [DONE]\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")

@router.post("/generate-report-text")
async def generate_report(req: ChatRequest):
    """Generate a structured safety audit report."""
    data = get_incidents()
    total = len(data)
    casualties = sum(r["casualties"] for r in data)
    from collections import Counter
    state_counts = Counter(r["state"] for r in data)
    acc_counts = Counter(r["accident_type"] for r in data)
    year_counts = Counter(r["year"] for r in data)
    severity_counts = Counter(r["severity"] for r in data)

    system = """You are a senior mining safety auditor generating a formal safety audit report.
Write in a professional, regulatory-report style. Include executive summary, key findings, 
risk analysis by state and accident type, trend analysis, and specific recommendations.
Use the provided data. Be concise but thorough. Format with clear sections."""

    user_content = f"""Generate a comprehensive Mining Safety Audit Report for Indian mines (2016-2022) based on:

SUMMARY STATISTICS:
- Total incidents: {total}
- Total casualties: {casualties}
- Severity: {dict(severity_counts)}
- Top 5 states: {dict(state_counts.most_common(5))}
- Accident types: {dict(acc_counts.most_common())}
- Incidents by year: {dict(sorted(year_counts.items()))}

Include: Executive Summary, Key Risk Findings, State-wise Analysis, Trend Analysis, and Top 5 Recommendations."""

    async with httpx.AsyncClient(timeout=60) as client:
        response = await client.post(
            CLAUDE_API_URL,
            headers={"Content-Type": "application/json"},
            json={
                "model": CLAUDE_MODEL,
                "max_tokens": 2000,
                "system": system,
                "messages": [{"role": "user", "content": user_content}],
            }
        )
    result = response.json()
    content = result.get("content", [{}])[0].get("text", "Report generation failed.")
    return {"report": content}
