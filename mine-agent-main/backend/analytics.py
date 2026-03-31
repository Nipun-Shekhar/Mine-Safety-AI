"""Analytics router — all aggregated statistics for the dashboard."""
from fastapi import APIRouter
from collections import Counter, defaultdict
from db import get_incidents

router = APIRouter()

@router.get("/summary")
def summary():
    data = get_incidents()
    total = len(data)
    casualties = sum(r["casualties"] for r in data)
    injured = sum(r["injured"] for r in data)
    high_severity = sum(1 for r in data if r["severity"] in ["High", "Critical"])
    critical = sum(1 for r in data if r["severity"] == "Critical")
    years = sorted(set(r["year"] for r in data))

    # Most common accident type
    acc_counts = Counter(r["accident_type"] for r in data)
    most_common_accident = acc_counts.most_common(1)[0][0]

    # Peak year
    year_counts = Counter(r["year"] for r in data)
    peak_year = max(year_counts, key=year_counts.get)

    # Avg casualties per incident
    avg_casualties = round(casualties / total, 2) if total else 0

    return {
        "total_incidents": total,
        "total_casualties": casualties,
        "total_injured": injured,
        "high_severity": high_severity,
        "critical": critical,
        "most_common_accident": most_common_accident,
        "peak_year": peak_year,
        "avg_casualties_per_incident": avg_casualties,
        "year_range": [min(years), max(years)],
    }

@router.get("/by-year")
def by_year():
    data = get_incidents()
    result = defaultdict(lambda: {"incidents": 0, "casualties": 0, "injured": 0})
    for r in data:
        y = r["year"]
        result[y]["incidents"] += 1
        result[y]["casualties"] += r["casualties"]
        result[y]["injured"] += r["injured"]
    return [{"year": y, **v} for y, v in sorted(result.items())]

@router.get("/by-state")
def by_state():
    data = get_incidents()
    result = defaultdict(lambda: {"incidents": 0, "casualties": 0})
    for r in data:
        s = r["state"]
        result[s]["incidents"] += 1
        result[s]["casualties"] += r["casualties"]
    return sorted(
        [{"state": s, **v} for s, v in result.items()],
        key=lambda x: x["incidents"], reverse=True
    )

@router.get("/by-accident-type")
def by_accident_type():
    data = get_incidents()
    result = defaultdict(lambda: {"count": 0, "casualties": 0})
    for r in data:
        t = r["accident_type"]
        result[t]["count"] += 1
        result[t]["casualties"] += r["casualties"]
    return sorted(
        [{"type": t, **v} for t, v in result.items()],
        key=lambda x: x["count"], reverse=True
    )

@router.get("/by-mine-type")
def by_mine_type():
    data = get_incidents()
    result = defaultdict(lambda: {"count": 0, "casualties": 0})
    for r in data:
        m = r["mine_type"]
        result[m]["count"] += 1
        result[m]["casualties"] += r["casualties"]
    return [{"mine_type": m, **v} for m, v in result.items()]

@router.get("/by-severity")
def by_severity():
    data = get_incidents()
    counts = Counter(r["severity"] for r in data)
    order = ["Low", "Medium", "High", "Critical"]
    return [{"severity": s, "count": counts.get(s, 0)} for s in order]

@router.get("/by-month")
def by_month():
    data = get_incidents()
    result = defaultdict(int)
    month_names = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
    for r in data:
        result[r["month"]] += 1
    return [{"month": month_names[m-1], "incidents": result[m]} for m in range(1, 13)]

@router.get("/trends")
def trends():
    """Year-over-year change and 3-year rolling averages."""
    data = get_incidents()
    year_counts = Counter(r["year"] for r in data)
    years = sorted(year_counts.keys())
    result = []
    for i, y in enumerate(years):
        prev = year_counts.get(y - 1, None)
        yoy = None
        if prev:
            yoy = round((year_counts[y] - prev) / prev * 100, 1)
        result.append({"year": y, "incidents": year_counts[y], "yoy_change_pct": yoy})
    return result

@router.get("/heatmap")
def heatmap():
    """State-level risk score for choropleth map."""
    data = get_incidents()
    state_data = defaultdict(lambda: {"incidents": 0, "casualties": 0, "critical": 0})
    for r in data:
        s = r["state"]
        state_data[s]["incidents"] += 1
        state_data[s]["casualties"] += r["casualties"]
        if r["severity"] == "Critical":
            state_data[s]["critical"] += 1

    result = []
    for state, v in state_data.items():
        risk_score = round(v["incidents"] * 0.4 + v["casualties"] * 0.4 + v["critical"] * 5, 1)
        result.append({"state": state, **v, "risk_score": risk_score})

    return sorted(result, key=lambda x: x["risk_score"], reverse=True)

@router.get("/shift-analysis")
def shift_analysis():
    data = get_incidents()
    result = defaultdict(lambda: {"incidents": 0, "casualties": 0})
    for r in data:
        sh = r["shift"]
        result[sh]["incidents"] += 1
        result[sh]["casualties"] += r["casualties"]
    return [{"shift": sh, **v} for sh, v in result.items()]

@router.get("/cause-analysis")
def cause_analysis():
    data = get_incidents()
    result = Counter(r["cause"] for r in data)
    return [{"cause": c, "count": n} for c, n in result.most_common(15)]
