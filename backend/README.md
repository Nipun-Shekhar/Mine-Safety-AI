# ⛏ Mine Agent v2.0
### AI-Driven Accident Intelligence & Safety Dashboard for Indian Mining

[![Python](https://img.shields.io/badge/Python-3.10+-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-green.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org)
[![ML Model](https://img.shields.io/badge/ML_Accuracy-84.55%25-orange.svg)](backend/ml/predictor.py)
[![Dataset](https://img.shields.io/badge/DGMS_Records-550%2B-purple.svg)](backend/data/)

---

## 🚀 What's New in v2.0

| Feature | Before | After |
|---|---|---|
| Dashboard numbers | Hardcoded | Live from data API |
| Dataset | None | 550+ DGMS-structured incidents |
| Chatbot | Generic LLM | RAG — answers from real incident DB |
| Analytics | Basic | YoY trends, shift analysis, risk heatmap |
| ML | None | Random Forest severity predictor (84.5% acc) |
| Visualizations | Bar charts only | Area, Radar, Pie, Line, Risk Bar charts |
| Navigation | 2 pages | 4 pages: Dashboard, Deep Analytics, ML Predictor, AI Chat |

---

## 🏗️ Architecture

```
mine-agent/
├── backend/
│   ├── main.py                   # FastAPI app
│   ├── db.py                     # Shared data loader (cached)
│   ├── requirements.txt
│   ├── data/
│   │   ├── generate_dataset.py   # Synthetic DGMS data generator
│   │   ├── dgms_incidents.json   # 550+ incident records
│   │   └── dgms_incidents.csv
│   ├── ml/
│   │   ├── predictor.py          # Random Forest severity model
│   │   ├── severity_model.pkl    # Trained model
│   │   └── label_encoders.pkl
│   └── routers/
│       ├── incidents.py          # CRUD + filtering endpoints
│       ├── analytics.py          # Aggregation & dashboard stats
│       ├── chat.py               # RAG-powered Claude chatbot
│       └── ml_routes.py          # Severity prediction endpoint
│
└── frontend/
    └── src/
        └── App.jsx               # Full React SPA (Dashboard, Analytics, ML, Chat)
```

---

## 🧠 Key Technical Features

### 1. Real Data Pipeline
550+ synthetic DGMS-structured incidents generated with:
- Realistic Indian mine names, states, and operators
- Correlated features (underground coal → higher severity)
- Covers 2016–2022, 10 accident types, 10 states

### 2. RAG-Powered AI Assistant
The chatbot is **not a generic LLM** — it does contextual retrieval:
- Parses the user query for year/state/type mentions
- Injects relevant subset of the incident database as context
- Claude API generates responses grounded in actual numbers
- Includes a formal "Generate Audit Report" mode

### 3. ML Severity Predictor
```python
Features: accident_type, mine_type, state, shift, is_underground, workers_on_site
Model:     RandomForestClassifier (n_estimators=150, balanced class weights)
Accuracy:  84.55%
Top feature: workers_on_site (36.25%), accident_type (22.24%), state (17.42%)
```

### 4. Analytics Suite
- Year-over-year trends with % change
- State-level composite risk index (incidents + casualties + critical events)
- Monthly seasonality analysis
- Shift-wise breakdown (Radar chart)
- Top 15 root causes by frequency
- Feature importance visualization

---

## ⚡ Quick Start

### Backend
```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Generate dataset (already done — skip if dgms_incidents.json exists)
python data/generate_dataset.py

# Train ML model (auto-trained on first prediction if skipped)
python ml/predictor.py

# Start API server
uvicorn main:app --reload --port 8000
```
API docs available at: http://localhost:8000/docs

### Frontend
```bash
cd frontend

npm install
npm run dev
```
App available at: http://localhost:5173

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/analytics/summary` | KPI cards: total incidents, casualties, peak year |
| GET | `/api/analytics/by-year` | Yearly incident + casualty counts |
| GET | `/api/analytics/by-state` | State breakdown sorted by incidents |
| GET | `/api/analytics/by-accident-type` | Accident type distribution |
| GET | `/api/analytics/heatmap` | State risk index (composite score) |
| GET | `/api/analytics/trends` | YoY % change analysis |
| GET | `/api/analytics/shift-analysis` | Shift-wise breakdown |
| GET | `/api/analytics/cause-analysis` | Top root causes |
| GET | `/api/incidents/` | Paginated, filterable incident list |
| GET | `/api/incidents/recent` | Most recent incidents |
| GET | `/api/incidents/filters/options` | Available filter values |
| POST | `/api/chat/message` | RAG chatbot (non-streaming) |
| POST | `/api/chat/stream` | RAG chatbot (SSE streaming) |
| POST | `/api/chat/generate-report-text` | Full audit report generation |
| POST | `/api/ml/predict-severity` | ML severity prediction |
| GET | `/api/ml/model-stats` | Model accuracy + feature importance |

---

## 🖥️ Frontend Pages

### 📊 Dashboard
Live statistics pulled from API. Filter by year, state, or accident type.
Charts: Area (incidents/casualties by year), Pie (severity), Bar (type & state), Monthly seasonality.

### 🔬 Deep Analytics
- YoY trend line chart with % change overlay
- State risk heatmap with composite scoring
- Shift analysis (Radar chart)
- Root cause frequency table
- ML model performance stats + feature importance bars

### ⚡ ML Predictor
Interactive form to predict accident severity. Select accident type, mine type, state, shift, underground flag, and worker count. Returns predicted severity + probability distribution.

### 🤖 AI Assistant
RAG-powered chat that answers questions with real data. Pre-built suggestion chips. Formal audit report generation button.

---

## 🔮 Roadmap

- [ ] Real DGMS PDF ingestion pipeline (pdfplumber + spaCy NER)
- [ ] India choropleth map (react-simple-maps)
- [ ] PDF export for audit reports (reportlab/weasyprint)
- [ ] Time-series anomaly detection (isolation forest)
- [ ] Alerting system for emerging patterns

---

## 🏆 Tech Stack

| Layer | Tech |
|---|---|
| Backend | Python, FastAPI, uvicorn |
| ML | scikit-learn (RandomForestClassifier) |
| AI | Anthropic Claude API (RAG) |
| Frontend | React 18, Recharts, Vite |
| Data | JSON/CSV (550+ structured records) |
| Styling | CSS-in-JS |
