import { useMemo } from "react";
import { AlertCircle } from "lucide-react";

export default function HomePage() {
  const incidents = [
    {
      id: "1",
      date: "2024-11-01",
      state: "Jharkhand",
      mineType: "Coal",
      machineryType: "Excavator",
      severity: "high",
      type: "machinery failure",
      description: "Excavator hydraulic system failure",
      casualties: 2,
      lat: 23.6102,
      lng: 85.2799,
    },
    {
      id: "2",
      date: "2024-10-28",
      state: "Odisha",
      mineType: "Iron Ore",
      machineryType: "Dump Truck",
      severity: "medium",
      type: "transportation",
      description: "Dump truck brake failure on slope",
      casualties: 1,
      lat: 21.9508,
      lng: 84.0917,
    },
    {
      id: "3",
      date: "2024-10-25",
      state: "Chhattisgarh",
      mineType: "Coal",
      machineryType: "N/A",
      severity: "high",
      type: "roof fall",
      description: "Underground roof collapse",
      casualties: 4,
      lat: 21.2787,
      lng: 81.8661,
    },
    {
      id: "4",
      date: "2024-10-20",
      state: "Jharkhand",
      mineType: "Coal",
      machineryType: "N/A",
      severity: "high",
      type: "fire",
      description: "Underground fire in coal seam",
      casualties: 3,
      lat: 23.3441,
      lng: 85.3096,
    },
    {
      id: "5",
      date: "2024-10-15",
      state: "West Bengal",
      mineType: "Coal",
      machineryType: "Conveyor Belt",
      severity: "low",
      type: "machinery failure",
      description: "Conveyor belt motor malfunction",
      casualties: 0,
      lat: 23.685,
      lng: 87.853,
    },
    {
      id: "6",
      date: "2024-10-10",
      state: "Madhya Pradesh",
      mineType: "Diamond",
      machineryType: "Drilling Rig",
      severity: "medium",
      type: "machinery failure",
      description: "Drilling rig structural failure",
      casualties: 1,
      lat: 24.5854,
      lng: 80.826,
    },
    {
      id: "7",
      date: "2024-10-05",
      state: "Jharkhand",
      mineType: "Coal",
      machineryType: "Haul Truck",
      severity: "high",
      type: "transportation",
      description: "Haul truck collision with stationary vehicle",
      casualties: 2,
      lat: 23.7957,
      lng: 86.4304,
    },
    {
      id: "8",
      date: "2024-09-30",
      state: "Odisha",
      mineType: "Bauxite",
      machineryType: "N/A",
      severity: "medium",
      type: "roof fall",
      description: "Minor roof fall in extraction area",
      casualties: 1,
      lat: 20.2961,
      lng: 85.8245,
    },
    {
      id: "9",
      date: "2024-09-25",
      state: "Karnataka",
      mineType: "Iron Ore",
      machineryType: "Loader",
      severity: "low",
      type: "machinery failure",
      description: "Loader engine overheating",
      casualties: 0,
      lat: 15.3173,
      lng: 75.7139,
    },
    {
      id: "10",
      date: "2024-09-20",
      state: "Chhattisgarh",
      mineType: "Coal",
      machineryType: "N/A",
      severity: "medium",
      type: "fire",
      description: "Equipment storage fire",
      casualties: 0,
      lat: 22.0797,
      lng: 82.1409,
    },
    {
      id: "11",
      date: "2024-09-15",
      state: "Jharkhand",
      mineType: "Coal",
      machineryType: "Shuttle Car",
      severity: "high",
      type: "transportation",
      description: "Shuttle car derailment",
      casualties: 3,
      lat: 23.6693,
      lng: 86.1511,
    },
    {
      id: "12",
      date: "2024-09-10",
      state: "Rajasthan",
      mineType: "Limestone",
      machineryType: "Crusher",
      severity: "medium",
      type: "machinery failure",
      description: "Crusher jaw mechanism failure",
      casualties: 1,
      lat: 27.0238,
      lng: 74.2179,
    },
  ];

  // ✅ Compute statistics dynamically
  const stats = useMemo(() => {
    const total = incidents.length;
    const casualties = incidents.reduce((sum, i) => sum + i.casualties, 0);
    const highSeverity = incidents.filter((i) => i.severity === "high").length;

    const typeCount = {};
    incidents.forEach((i) => {
      typeCount[i.type] = (typeCount[i.type] || 0) + 1;
    });

    return { total, casualties, highSeverity, typeCount };
  }, [incidents]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Mining Accident Dashboard</h2>
        <p className="text-gray-600">Real-time overview of mining safety incidents in India</p>
      </div>

      {/* ✅ Stats Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <DynamicStatCard title="Total Incidents" value={559} />
        <DynamicStatCard title="Casualties" value={666} />
        <DynamicStatCard title="High Severity" value={232} />
      </div>

      {/* ✅ Type Distribution */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Incident Type Distribution</h3>
        <div className="space-y-4">
          {Object.entries(stats.typeCount).map(([type, count]) => {
            const percent = ((count / stats.total) * 100).toFixed(1);
            return (
              <div key={type}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700 capitalize">{type}</span>
                  <span className="text-gray-900 font-medium">
                    {count} ({percent}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-blue-600 h-3 rounded-full"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ✅ Recent Incidents */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Incidents</h3>
        {incidents.slice(0, 8).map((incident) => (
          <IncidentCard key={incident.id} incident={incident} />
        ))}
      </div>
    </div>
  );
}

/* ✅ Dynamic Stat Card */
function DynamicStatCard({ title, value }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-2">
        <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
          <AlertCircle size={24} />
        </div>
      </div>
      <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
      <p className="text-sm text-gray-600">{title}</p>
    </div>
  );
}

/* ✅ Clean Incident Card */
function IncidentCard({ incident }) {
  const severityColors = {
    high: "bg-red-100 text-red-800 border-red-200",
    medium: "bg-orange-100 text-orange-800 border-orange-200",
    low: "bg-yellow-100 text-yellow-800 border-yellow-200",
  };

  return (
    <div className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg mb-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h4 className="text-sm font-semibold text-gray-900 capitalize">
            {incident.type}
          </h4>
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full border ${
              severityColors[incident.severity] || "bg-gray-100 text-gray-800 border-gray-200"
            }`}
          >
            {incident.severity.toUpperCase()}
          </span>
        </div>

        <p className="text-sm text-gray-700 mb-2">{incident.description}</p>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
          <span>{incident.date}</span>
          <span>{incident.state}</span>
          <span>{incident.mineType}</span>
          {incident.machineryType && <span>{incident.machineryType}</span>}
          <span className="text-red-600 font-medium">{incident.casualties} casualties</span>
        </div>
      </div>
    </div>
  );
}
