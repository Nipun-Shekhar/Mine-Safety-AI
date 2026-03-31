import { useState, useEffect, useRef, useCallback } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Legend, AreaChart, Area,
} from "recharts";

const API = "http://localhost:8000/api";

const SEVERITY_COLORS = { Low: "#22c55e", Medium: "#f59e0b", High: "#f97316", Critical: "#ef4444" };
const PALETTE = ["#3b82f6","#8b5cf6","#06b6d4","#10b981","#f59e0b","#ef4444","#ec4899","#84cc16","#f97316","#6366f1"];

// ── Reusable stat card ──
function StatCard({ label, value, sub, color = "#3b82f6", icon }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 16, padding: "24px 28px", display: "flex", flexDirection: "column",
      gap: 8, backdropFilter: "blur(8px)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span style={{ color: "#94a3b8", fontSize: 13, fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase" }}>{label}</span>
        <span style={{ fontSize: 22 }}>{icon}</span>
      </div>
      <div style={{ color, fontSize: 36, fontWeight: 800, lineHeight: 1, fontFamily: "'JetBrains Mono', monospace" }}>
        {value?.toLocaleString?.() ?? value}
      </div>
      {sub && <div style={{ color: "#64748b", fontSize: 12 }}>{sub}</div>}
    </div>
  );
}

// ── Section wrapper ──
function Section({ title, children, action }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ margin: 0, color: "#e2e8f0", fontSize: 17, fontWeight: 700, letterSpacing: "-0.01em" }}>{title}</h2>
        {action}
      </div>
      {children}
    </div>
  );
}

// ── Custom tooltip ──
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 10, padding: "10px 16px", fontSize: 13 }}>
      <div style={{ color: "#94a3b8", marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || "#e2e8f0", fontWeight: 600 }}>
          {p.name}: {typeof p.value === "number" ? p.value.toLocaleString() : p.value}
        </div>
      ))}
    </div>
  );
}

// ── Severity badge ──
function SeverityBadge({ severity }) {
  const colors = { Low: "#166534", Medium: "#854d0e", High: "#9a3412", Critical: "#7f1d1d" };
  const textColors = { Low: "#4ade80", Medium: "#fbbf24", High: "#fb923c", Critical: "#f87171" };
  return (
    <span style={{
      background: colors[severity], color: textColors[severity],
      padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700,
      letterSpacing: "0.05em", textTransform: "uppercase"
    }}>{severity}</span>
  );
}

// ────────────────────────────────────────────────────────────
// DASHBOARD PAGE
// ────────────────────────────────────────────────────────────
function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [byYear, setByYear] = useState([]);
  const [byType, setByType] = useState([]);
  const [byState, setByState] = useState([]);
  const [byMonth, setByMonth] = useState([]);
  const [severity, setSeverity] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ year: "", state: "", accident_type: "" });
  const [filterOptions, setFilterOptions] = useState({ years: [], states: [], accident_types: [] });

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.year) params.append("year", filters.year);
    if (filters.state) params.append("state", filters.state);
    if (filters.accident_type) params.append("accident_type", filters.accident_type);

    try {
      const [sum, yr, typ, st, mo, sev, rec, opts] = await Promise.all([
        fetch(`${API}/analytics/summary`).then(r => r.json()),
        fetch(`${API}/analytics/by-year`).then(r => r.json()),
        fetch(`${API}/analytics/by-accident-type`).then(r => r.json()),
        fetch(`${API}/analytics/by-state`).then(r => r.json()),
        fetch(`${API}/analytics/by-month`).then(r => r.json()),
        fetch(`${API}/analytics/by-severity`).then(r => r.json()),
        fetch(`${API}/incidents/recent?limit=8`).then(r => r.json()),
        fetch(`${API}/incidents/filters/options`).then(r => r.json()),
      ]);
      setSummary(sum); setByYear(yr); setByType(typ); setByState(st);
      setByMonth(mo); setSeverity(sev); setRecent(rec); setFilterOptions(opts);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  if (loading && !summary) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 400, color: "#64748b" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 32, marginBottom: 12, animation: "spin 1s linear infinite" }}>⚙️</div>
        <div>Loading incident data...</div>
      </div>
    </div>
  );

  return (
    <div>
      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 28, flexWrap: "wrap" }}>
        {[
          { key: "year", label: "Year", options: filterOptions.years },
          { key: "state", label: "State", options: filterOptions.states },
          { key: "accident_type", label: "Accident Type", options: filterOptions.accident_types },
        ].map(({ key, label, options }) => (
          <select key={key} value={filters[key]}
            onChange={e => setFilters(f => ({ ...f, [key]: e.target.value }))}
            style={{
              background: "#1e293b", border: "1px solid #334155", color: "#e2e8f0",
              padding: "8px 14px", borderRadius: 8, fontSize: 13, cursor: "pointer", minWidth: 130
            }}>
            <option value="">All {label}s</option>
            {options.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        ))}
        <button onClick={load} style={{
          background: "#3b82f6", color: "white", border: "none", padding: "8px 18px",
          borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600
        }}>Apply</button>
        {Object.values(filters).some(Boolean) && (
          <button onClick={() => setFilters({ year: "", state: "", accident_type: "" })} style={{
            background: "transparent", color: "#64748b", border: "1px solid #334155",
            padding: "8px 14px", borderRadius: 8, cursor: "pointer", fontSize: 13
          }}>Clear</button>
        )}
      </div>

      {/* KPI cards */}
      {summary && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 32 }}>
          <StatCard label="Total Incidents" value={summary.total_incidents} sub="DGMS 2016–2022" color="#3b82f6" icon="📋" />
          <StatCard label="Total Casualties" value={summary.total_casualties} sub={`Avg ${summary.avg_casualties_per_incident}/incident`} color="#ef4444" icon="💔" />
          <StatCard label="Total Injured" value={summary.total_injured} sub="Excluding fatalities" color="#f97316" icon="🚑" />
          <StatCard label="High + Critical" value={summary.high_severity} sub={`${summary.critical} critical`} color="#f59e0b" icon="⚠️" />
          <StatCard label="Peak Year" value={summary.peak_year} sub="Highest incident year" color="#8b5cf6" icon="📈" />
          <StatCard label="Top Cause" value={summary.most_common_accident} sub="Most frequent type" color="#06b6d4" icon="🔍" />
        </div>
      )}

      {/* Charts row 1 */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, marginBottom: 20 }}>
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 24 }}>
          <h3 style={{ color: "#e2e8f0", margin: "0 0 20px", fontSize: 15, fontWeight: 600 }}>Incidents & Casualties by Year</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={byYear}>
              <defs>
                <linearGradient id="incGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="casGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="year" stroke="#475569" tick={{ fontSize: 12 }} />
              <YAxis stroke="#475569" tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area type="monotone" dataKey="incidents" stroke="#3b82f6" fill="url(#incGrad)" strokeWidth={2} name="Incidents" />
              <Area type="monotone" dataKey="casualties" stroke="#ef4444" fill="url(#casGrad)" strokeWidth={2} name="Casualties" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 24 }}>
          <h3 style={{ color: "#e2e8f0", margin: "0 0 20px", fontSize: 15, fontWeight: 600 }}>Severity Distribution</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={severity} cx="50%" cy="50%" outerRadius={90} dataKey="count" nameKey="severity" label={({ severity: s, percent }) => `${s} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                {severity.map((entry) => (
                  <Cell key={entry.severity} fill={SEVERITY_COLORS[entry.severity]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts row 2 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 24 }}>
          <h3 style={{ color: "#e2e8f0", margin: "0 0 20px", fontSize: 15, fontWeight: 600 }}>Accidents by Type</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={byType} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis type="number" stroke="#475569" tick={{ fontSize: 11 }} />
              <YAxis dataKey="type" type="category" stroke="#475569" tick={{ fontSize: 11 }} width={140} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Incidents" radius={[0, 4, 4, 0]}>
                {byType.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 24 }}>
          <h3 style={{ color: "#e2e8f0", margin: "0 0 20px", fontSize: 15, fontWeight: 600 }}>Top States by Incidents</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={byState.slice(0, 8)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="state" stroke="#475569" tick={{ fontSize: 11 }} angle={-25} textAnchor="end" height={50} />
              <YAxis stroke="#475569" tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="incidents" name="Incidents" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="casualties" name="Casualties" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly seasonality */}
      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 24, marginBottom: 20 }}>
        <h3 style={{ color: "#e2e8f0", margin: "0 0 20px", fontSize: 15, fontWeight: 600 }}>Monthly Seasonality (avg incidents)</h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={byMonth}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="month" stroke="#475569" tick={{ fontSize: 12 }} />
            <YAxis stroke="#475569" tick={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="incidents" name="Incidents" fill="#06b6d4" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent incidents table */}
      <Section title="Recent Incidents">
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "rgba(255,255,255,0.05)" }}>
                {["Date", "Type", "Mine / State", "Mine Type", "Casualties", "Severity"].map(h => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", color: "#64748b", fontWeight: 600, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recent.map((r, i) => (
                <tr key={r.incident_id} style={{ borderTop: "1px solid rgba(255,255,255,0.04)", background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)" }}>
                  <td style={{ padding: "12px 16px", color: "#94a3b8" }}>{r.date}</td>
                  <td style={{ padding: "12px 16px", color: "#e2e8f0", fontWeight: 500 }}>{r.accident_type}</td>
                  <td style={{ padding: "12px 16px", color: "#94a3b8" }}>{r.mine_name}<br /><span style={{ color: "#475569", fontSize: 11 }}>{r.state}</span></td>
                  <td style={{ padding: "12px 16px", color: "#94a3b8" }}>{r.mine_type}</td>
                  <td style={{ padding: "12px 16px", color: r.casualties > 0 ? "#ef4444" : "#94a3b8", fontWeight: r.casualties > 0 ? 700 : 400 }}>{r.casualties}</td>
                  <td style={{ padding: "12px 16px" }}><SeverityBadge severity={r.severity} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// ANALYTICS PAGE
// ────────────────────────────────────────────────────────────
function Analytics() {
  const [heatmap, setHeatmap] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [causes, setCauses] = useState([]);
  const [trends, setTrends] = useState([]);
  const [mlStats, setMlStats] = useState(null);

  useEffect(() => {
    Promise.all([
      fetch(`${API}/analytics/heatmap`).then(r => r.json()),
      fetch(`${API}/analytics/shift-analysis`).then(r => r.json()),
      fetch(`${API}/analytics/cause-analysis`).then(r => r.json()),
      fetch(`${API}/analytics/trends`).then(r => r.json()),
      fetch(`${API}/ml/model-stats`).then(r => r.json()),
    ]).then(([h, sh, ca, tr, ml]) => {
      setHeatmap(h); setShifts(sh); setCauses(ca); setTrends(tr); setMlStats(ml);
    });
  }, []);

  return (
    <div>
      {/* Trends */}
      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 24, marginBottom: 20 }}>
        <h3 style={{ color: "#e2e8f0", margin: "0 0 20px", fontSize: 15, fontWeight: 600 }}>Year-over-Year Trend</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={trends}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="year" stroke="#475569" tick={{ fontSize: 12 }} />
            <YAxis yAxisId="left" stroke="#475569" tick={{ fontSize: 12 }} />
            <YAxis yAxisId="right" orientation="right" stroke="#475569" tick={{ fontSize: 12 }} unit="%" />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar yAxisId="left" dataKey="incidents" name="Incidents" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            <Line yAxisId="right" type="monotone" dataKey="yoy_change_pct" name="YoY Change %" stroke="#f59e0b" strokeWidth={2} dot={{ fill: "#f59e0b", r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* State risk heatmap */}
      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 24, marginBottom: 20 }}>
        <h3 style={{ color: "#e2e8f0", margin: "0 0 6px", fontSize: 15, fontWeight: 600 }}>State Risk Index</h3>
        <p style={{ color: "#64748b", fontSize: 12, margin: "0 0 20px" }}>Composite score based on incident count, casualties, and critical events.</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {heatmap.slice(0, 10).map((d, i) => {
            const max = heatmap[0]?.risk_score || 1;
            const pct = (d.risk_score / max) * 100;
            const color = pct > 80 ? "#ef4444" : pct > 60 ? "#f97316" : pct > 40 ? "#f59e0b" : pct > 20 ? "#3b82f6" : "#22c55e";
            return (
              <div key={d.state} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 120, color: "#94a3b8", fontSize: 13, flexShrink: 0 }}>{d.state}</div>
                <div style={{ flex: 1, height: 20, background: "rgba(255,255,255,0.05)", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 4, transition: "width 0.8s ease" }} />
                </div>
                <div style={{ width: 50, color: "#64748b", fontSize: 12, textAlign: "right" }}>{d.risk_score}</div>
                <div style={{ width: 70, color: "#64748b", fontSize: 11 }}>{d.incidents} inc</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Shifts + causes */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 24 }}>
          <h3 style={{ color: "#e2e8f0", margin: "0 0 20px", fontSize: 15, fontWeight: 600 }}>Incidents by Shift</h3>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={shifts}>
              <PolarGrid stroke="#334155" />
              <PolarAngleAxis dataKey="shift" stroke="#64748b" tick={{ fontSize: 12 }} />
              <PolarRadiusAxis stroke="#334155" tick={{ fontSize: 10 }} />
              <Radar name="Incidents" dataKey="incidents" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
              <Radar name="Casualties" dataKey="casualties" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 24 }}>
          <h3 style={{ color: "#e2e8f0", margin: "0 0 16px", fontSize: 15, fontWeight: 600 }}>Top Root Causes</h3>
          <div style={{ overflowY: "auto", maxHeight: 220 }}>
            {causes.slice(0, 12).map((c, i) => (
              <div key={c.cause} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <span style={{ color: "#94a3b8", fontSize: 12, flex: 1, paddingRight: 8 }}>{c.cause}</span>
                <span style={{ color: PALETTE[i % PALETTE.length], fontWeight: 700, fontSize: 13, minWidth: 28, textAlign: "right" }}>{c.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ML Model card */}
      {mlStats && (
        <div style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 16, padding: 24 }}>
          <h3 style={{ color: "#e2e8f0", margin: "0 0 6px", fontSize: 15, fontWeight: 600 }}>🤖 ML Severity Predictor — Model Stats</h3>
          <p style={{ color: "#64748b", fontSize: 12, margin: "0 0 20px" }}>
            Random Forest trained on {mlStats.training_samples} incidents. Predicts severity from accident type, mine type, state, shift, and workforce size.
          </p>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap", marginBottom: 20 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ color: "#3b82f6", fontSize: 36, fontWeight: 800 }}>{(mlStats.accuracy * 100).toFixed(1)}%</div>
              <div style={{ color: "#64748b", fontSize: 12 }}>Accuracy</div>
            </div>
            {Object.entries(mlStats.feature_importance).map(([feat, imp]) => (
              <div key={feat} style={{ flex: 1, minWidth: 100 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                  <span style={{ color: "#94a3b8" }}>{feat.replace(/_/g, " ")}</span>
                  <span style={{ color: "#3b82f6", fontWeight: 600 }}>{(imp * 100).toFixed(1)}%</span>
                </div>
                <div style={{ height: 6, background: "#1e293b", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ width: `${imp * 100}%`, height: "100%", background: "#3b82f6", borderRadius: 3 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// ML PREDICTOR PAGE
// ────────────────────────────────────────────────────────────
function Predictor() {
  const [form, setForm] = useState({
    accident_type: "Roof Fall", mine_type: "Coal", state: "Jharkhand",
    shift: "Morning", is_underground: true, workers_on_site: 100,
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const ACC_TYPES = ["Roof Fall","Gas/Fumes Explosion","Inundation/Flooding","Machinery Failure",
    "Transportation Accident","Fire","Blasting Accident","Electrical Accident","Slope Failure","Winding Accident"];
  const MINE_TYPES = ["Coal","Iron Ore","Limestone","Bauxite","Copper","Manganese","Mica"];
  const STATES = ["Jharkhand","Odisha","Chhattisgarh","West Bengal","Madhya Pradesh","Telangana","Andhra Pradesh","Rajasthan","Karnataka","Maharashtra"];

  const predict = async () => {
    setLoading(true);
    const res = await fetch(`${API}/ml/predict-severity`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, workers_on_site: parseInt(form.workers_on_site) }),
    });
    setResult(await res.json());
    setLoading(false);
  };

  const inputStyle = {
    background: "#1e293b", border: "1px solid #334155", color: "#e2e8f0",
    padding: "10px 14px", borderRadius: 8, fontSize: 13, width: "100%",
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 28 }}>
        <h2 style={{ color: "#e2e8f0", margin: "0 0 6px", fontSize: 18, fontWeight: 700 }}>⚡ ML Severity Predictor</h2>
        <p style={{ color: "#64748b", margin: "0 0 24px", fontSize: 13 }}>
          Predict accident severity using our Random Forest model (84.55% accuracy) trained on DGMS 2016–2022 data.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
          {[
            { key: "accident_type", label: "Accident Type", options: ACC_TYPES },
            { key: "mine_type", label: "Mine Type", options: MINE_TYPES },
            { key: "state", label: "State", options: STATES },
            { key: "shift", label: "Shift", options: ["Morning", "Afternoon", "Night"] },
          ].map(({ key, label, options }) => (
            <div key={key}>
              <label style={{ color: "#94a3b8", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>{label}</label>
              <select value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} style={inputStyle}>
                {options.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          ))}
          <div>
            <label style={{ color: "#94a3b8", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>Workers on Site</label>
            <input type="number" min={1} max={1000} value={form.workers_on_site}
              onChange={e => setForm(f => ({ ...f, workers_on_site: e.target.value }))} style={inputStyle} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
            <label style={{ color: "#94a3b8", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>Underground Mine?</label>
            <div style={{ display: "flex", gap: 12 }}>
              {["Yes", "No"].map(opt => (
                <button key={opt} onClick={() => setForm(f => ({ ...f, is_underground: opt === "Yes" }))}
                  style={{
                    flex: 1, padding: "10px", borderRadius: 8, border: "1px solid",
                    borderColor: (opt === "Yes") === form.is_underground ? "#3b82f6" : "#334155",
                    background: (opt === "Yes") === form.is_underground ? "rgba(59,130,246,0.15)" : "transparent",
                    color: (opt === "Yes") === form.is_underground ? "#3b82f6" : "#64748b",
                    cursor: "pointer", fontWeight: 600, fontSize: 13
                  }}>{opt}</button>
              ))}
            </div>
          </div>
        </div>

        <button onClick={predict} disabled={loading} style={{
          width: "100%", padding: "13px", background: "#3b82f6", color: "white",
          border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer",
          opacity: loading ? 0.7 : 1
        }}>
          {loading ? "Predicting..." : "Predict Severity"}
        </button>

        {result && (
          <div style={{ marginTop: 24, padding: 20, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12 }}>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{ fontSize: 13, color: "#64748b", marginBottom: 8 }}>Predicted Severity</div>
              <SeverityBadge severity={result.prediction} />
              <div style={{ color: "#94a3b8", fontSize: 13, marginTop: 8 }}>
                Confidence: <strong style={{ color: "#e2e8f0" }}>{(result.confidence * 100).toFixed(1)}%</strong>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
              {Object.entries(result.probabilities).map(([sev, prob]) => (
                <div key={sev} style={{ textAlign: "center" }}>
                  <div style={{ color: SEVERITY_COLORS[sev], fontSize: 20, fontWeight: 700 }}>{(prob * 100).toFixed(0)}%</div>
                  <div style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase" }}>{sev}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// CHAT PAGE
// ────────────────────────────────────────────────────────────
function Chat() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hello! I'm your Mine Safety AI Officer. I have access to 550+ DGMS incident records from 2016–2022. Ask me about accident trends, state-wise analysis, safety recommendations, or generate an audit report." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const suggestions = [
    "What are the most dangerous states for mining?",
    "Show accident trends from 2016 to 2022",
    "What causes most casualties in coal mines?",
    "How many incidents occurred in 2019?",
    "Give safety recommendations for Jharkhand",
    "Which accident type is most fatal?",
  ];

  const sendMessage = async (text = input) => {
    if (!text.trim() || loading) return;
    const userMsg = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    const res = await fetch(`${API}/chat/message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: newMessages.map(m => ({ role: m.role, content: m.content })) }),
    });
    const data = await res.json();
    setMessages(m => [...m, { role: "assistant", content: data.reply }]);
    setLoading(false);
  };

  const generateReport = async () => {
    setGenerating(true);
    const msg = { role: "user", content: "Generate a comprehensive mining safety audit report" };
    setMessages(m => [...m, msg]);
    const res = await fetch(`${API}/chat/generate-report-text`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [msg] }),
    });
    const data = await res.json();
    setMessages(m => [...m, { role: "assistant", content: data.report }]);
    setGenerating(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 120px)", maxWidth: 900, margin: "0 auto" }}>
      {/* Suggestions */}
      {messages.length <= 1 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
          {suggestions.map(s => (
            <button key={s} onClick={() => sendMessage(s)} style={{
              background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.3)",
              color: "#93c5fd", padding: "6px 14px", borderRadius: 20, fontSize: 12,
              cursor: "pointer", transition: "all 0.2s"
            }}>{s}</button>
          ))}
        </div>
      )}

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 16, paddingBottom: 16 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", gap: 12 }}>
            {m.role === "assistant" && (
              <div style={{ width: 36, height: 36, background: "rgba(59,130,246,0.2)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 16 }}>🤖</div>
            )}
            <div style={{
              maxWidth: "78%", padding: "14px 18px", borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
              background: m.role === "user" ? "#3b82f6" : "rgba(255,255,255,0.05)",
              border: m.role === "assistant" ? "1px solid rgba(255,255,255,0.08)" : "none",
              color: "#e2e8f0", fontSize: 14, lineHeight: 1.7, whiteSpace: "pre-wrap",
            }}>{m.content}</div>
            {m.role === "user" && (
              <div style={{ width: 36, height: 36, background: "rgba(139,92,246,0.2)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 16 }}>👤</div>
            )}
          </div>
        ))}
        {(loading || generating) && (
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ width: 36, height: 36, background: "rgba(59,130,246,0.2)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>🤖</div>
            <div style={{ padding: "14px 18px", borderRadius: "18px 18px 18px 4px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ display: "flex", gap: 6 }}>
                {[0, 1, 2].map(i => <div key={i} style={{ width: 8, height: 8, background: "#3b82f6", borderRadius: "50%", animation: `bounce 1.4s ease-in-out ${i * 0.2}s infinite` }} />)}
              </div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input + Generate Report */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <button onClick={generateReport} disabled={generating} style={{
          padding: "12px", background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.4)",
          color: "#34d399", borderRadius: 10, cursor: "pointer", fontSize: 14, fontWeight: 600
        }}>
          📄 Generate Safety Audit Report
        </button>
        <div style={{ display: "flex", gap: 10 }}>
          <input value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
            placeholder="Ask about incidents, trends, recommendations..."
            style={{
              flex: 1, background: "#1e293b", border: "1px solid #334155", color: "#e2e8f0",
              padding: "13px 16px", borderRadius: 10, fontSize: 14, outline: "none"
            }} />
          <button onClick={() => sendMessage()} disabled={loading || !input.trim()} style={{
            background: "#3b82f6", color: "white", border: "none", padding: "0 20px",
            borderRadius: 10, cursor: "pointer", fontSize: 18, opacity: loading ? 0.5 : 1
          }}>➤</button>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// MAIN APP
// ────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("dashboard");

  const nav = [
    { id: "dashboard", label: "📊 Dashboard" },
    { id: "analytics", label: "🔬 Deep Analytics" },
    { id: "predictor", label: "⚡ ML Predictor" },
    { id: "chat", label: "🤖 AI Assistant" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0f172a; }
        ::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-8px); }
        }
      `}</style>

      {/* Header */}
      <header style={{
        background: "rgba(15,23,42,0.95)", borderBottom: "1px solid rgba(255,255,255,0.06)",
        padding: "0 40px", display: "flex", alignItems: "center", justifyContent: "space-between",
        height: 64, position: "sticky", top: 0, zIndex: 100, backdropFilter: "blur(12px)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>⛏</div>
          <div>
            <div style={{ color: "#e2e8f0", fontWeight: 800, fontSize: 16, lineHeight: 1.2 }}>Mine Agent</div>
            <div style={{ color: "#475569", fontSize: 11 }}>DGMS Safety Intelligence Platform</div>
          </div>
        </div>
        <nav style={{ display: "flex", gap: 4 }}>
          {nav.map(({ id, label }) => (
            <button key={id} onClick={() => setPage(id)} style={{
              background: page === id ? "rgba(59,130,246,0.15)" : "transparent",
              border: page === id ? "1px solid rgba(59,130,246,0.4)" : "1px solid transparent",
              color: page === id ? "#93c5fd" : "#64748b", padding: "8px 16px", borderRadius: 8,
              cursor: "pointer", fontSize: 13, fontWeight: page === id ? 600 : 400, transition: "all 0.2s"
            }}>{label}</button>
          ))}
        </nav>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 8, height: 8, background: "#22c55e", borderRadius: "50%", animation: "pulse 2s infinite" }} />
          <span style={{ color: "#22c55e", fontSize: 12, fontWeight: 600 }}>LIVE</span>
        </div>
      </header>

      {/* Main */}
      <main style={{ padding: "32px 40px", maxWidth: 1400, margin: "0 auto" }}>
        {page === "dashboard" && <Dashboard />}
        {page === "analytics" && <Analytics />}
        {page === "predictor" && <Predictor />}
        {page === "chat" && <Chat />}
      </main>
    </div>
  );
}
