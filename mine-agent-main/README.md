# Mine Agent  
*AI-Driven Accident Intelligence & Safety Dashboard for Indian Mining*

## 🚀 Project Overview  
Mining is one of India’s most critical industries, yet it remains prone to frequent and severe accidents. Traditional methods of analyzing mining incidents are often manual and fragmented, limiting the ability to uncover actionable safety insights. To address this challenge, Mine Agent leverages Artificial Intelligence (AI) and Natural Language Processing (NLP) to digitize and analyze over 300 accident records from the Directorate General of Mines Safety (DGMS), India (2016–2022).

The platform automatically extracts key information such as accident type, cause, location, and severity, enabling users to explore real-time trends, locations, and patterns through an interactive, data-rich dashboard. By integrating AI-based classification, pattern detection, and automated reporting, Mine Agent significantly enhances the speed and accuracy of mining safety analysis.

Designed with modularity and scalability in mind, the system adapts to mining operations of all sizes, providing a unified, intelligent solution for hazard detection, root-cause investigation, and regulatory compliance. Ultimately, Mine Agent represents a step toward transforming raw safety data into meaningful intelligence for a safer and more efficient mining industry.

### Key Objectives  
- Ingest and preprocess unstructured incident reports from the Directorate General of Mines Safety (DGMS) covering 2016-2022.  
- Use NLP to extract structured features (e.g., accident cause, mine-type, location, fatalities).  
- Perform trend and pattern analysis (by year, state, mine-type, cause).  
- Provide a powerful, high-tech dashboard interface for interactive exploration and filtering.  
- Generate automated safety-audit reports and support conversational querying via an AI assistant.  
- Empower stakeholders (mine operators, safety officers, regulators) with insights to reduce hazards and improve protocols.

---

## 📦 Architecture & Folder Structure  
- **backend/**: Contains modules for data ingestion, preprocessing, feature extraction (NER, classification), analytics (clustering, correlations), API endpoints.  
- **frontend/**: Built with React (or equivalent), includes dashboard views (overview + deep analytics), filter panels, AI chat interface, report generator.  
- **README.md**: Project documentation, installation instructions, usage guide and contribution info.

---

## 🧠 Features  
- **Overview Dashboard**: Summary cards (Total Accidents, Fatalities, Most Common Cause, Peak Year), time-series chart of accidents per year, India-state heatmap, accident-cause distribution pie chart.  
- **Deep Analytics**: Sidebar filters (Year range, Mine type, Accident type, State, Fatalities range), bar chart (Top states by accident count), correlation-matrix heatmap, time-series comparisons by cause/mine-type.  
- **AI Pattern Insights**: Automatic insight cards summarizing emerging trends (e.g., “Rise in methane-related accidents in Jharkhand 2021-22”), cluster visualisations of similar accidents.  
- **Interactive AI Query Interface**: “Digital Mine Safety Officer” chat panel where users ask natural-language questions like:  
  - *“Show all machinery-related accidents in 2020.”*  
  - *“Generate safety recommendations for mines in Chhattisgarh.”*  
- **Automated Safety Report Generator**: Export PDF reports based on selected filters, including summary statistics, charts and AI-generated recommendations.  
- **Tech Stack Highlights**:  
  - Frontend: React + TailwindCSS (or Next.js)  
  - Charts & Visualisations: Plotly.js / Recharts  
  - Backend: Python (FastAPI / Flask) with NLP & ML pipelines (spaCy, Hugging Face).  
  - Database: PostgreSQL / MongoDB for structured data; optional vector-database for semantic search.  
  - Deployment: Containerised (Docker), CI/CD support, hosted via Vercel or AWS.  

---

## 🛠️ Installation & Setup  

### Prerequisites  
- Node.js (v16+) and npm/yarn  
- Python 3.9+  
- PostgreSQL (or MongoDB) instance  
- Docker (optional but recommended)  
