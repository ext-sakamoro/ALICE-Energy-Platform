"use client";
import { useState } from "react";

type Tab = "grid-simulate" | "battery-predict" | "demand-forecast" | "optimize" | "stats";

const DEFAULTS: Record<Tab, string> = {
  "grid-simulate": JSON.stringify({
    grid_id: "GRID-TOKYO-001",
    simulation_window_hours: 24,
    renewable_sources: [
      { type: "solar", capacity_mw: 500, location: "kanto" },
      { type: "wind",  capacity_mw: 300, location: "coastal" }
    ],
    demand_baseline_mw: 8500,
    weather_scenario: "summer_peak"
  }, null, 2),
  "battery-predict": JSON.stringify({
    battery_id: "BATT-STORAGE-001",
    chemistry: "LFP",
    capacity_kwh: 10000,
    current_soc_pct: 75.0,
    charge_cycles: 1200,
    temperature_celsius: 25.0,
    forecast_horizon_hours: 48
  }, null, 2),
  "demand-forecast": JSON.stringify({
    region: "kanto",
    forecast_horizon_hours: 72,
    resolution_minutes: 30,
    include_weather: true,
    include_holidays: true,
    model: "hybrid_lstm_xgboost"
  }, null, 2),
  optimize: JSON.stringify({
    grid_id: "GRID-TOKYO-001",
    objective: "minimize_cost",
    constraints: {
      max_co2_kg_per_kwh: 0.3,
      min_renewable_pct: 40,
      battery_reserve_pct: 20
    },
    time_horizon_hours: 24
  }, null, 2),
  stats: JSON.stringify({}, null, 2),
};

const ENDPOINTS: Record<Tab, { method: string; path: string }> = {
  "grid-simulate":   { method: "POST", path: "/api/v1/energy/grid/simulate" },
  "battery-predict": { method: "POST", path: "/api/v1/energy/battery/predict" },
  "demand-forecast": { method: "POST", path: "/api/v1/energy/demand/forecast" },
  optimize:          { method: "POST", path: "/api/v1/energy/optimize" },
  stats:             { method: "GET",  path: "/api/v1/stats" },
};

const TAB_LABELS: Record<Tab, string> = {
  "grid-simulate":   "Grid Simulate",
  "battery-predict": "Battery Predict",
  "demand-forecast": "Demand Forecast",
  optimize:          "Optimize",
  stats:             "Stats",
};

export default function ConsolePage() {
  const [activeTab, setActiveTab] = useState<Tab>("grid-simulate");
  const [inputs, setInputs] = useState<Record<Tab, string>>(DEFAULTS);
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const API = "http://localhost:8081";

  const send = async () => {
    setLoading(true);
    setResponse("");
    const { method, path } = ENDPOINTS[activeTab];
    try {
      const opts: RequestInit = { method, headers: { "Content-Type": "application/json" } };
      if (method !== "GET") opts.body = inputs[activeTab];
      const res = await fetch(`${API}${path}`, opts);
      setResponse(JSON.stringify(await res.json(), null, 2));
    } catch (e: any) {
      setResponse(`Error: ${e.message}`);
    }
    setLoading(false);
  };

  const tabs: Tab[] = ["grid-simulate", "battery-predict", "demand-forecast", "optimize", "stats"];

  return (
    <div style={{ padding: 24, fontFamily: "monospace", background: "#0a0a0a", minHeight: "100vh", color: "#fff" }}>
      <h1 style={{ marginBottom: 4 }}>ALICE Energy-Platform — Console</h1>
      <p style={{ color: "#888", marginBottom: 24, fontSize: 14 }}>
        Energy grid simulation with battery prediction, demand forecasting, and optimization.
      </p>

      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "8px 16px",
              background: activeTab === tab ? "#16a34a" : "#1a1a2e",
              color: activeTab === tab ? "#fff" : "#ccc",
              border: "1px solid #333",
              borderRadius: 6,
              cursor: "pointer",
              fontFamily: "monospace",
              fontWeight: activeTab === tab ? 700 : 400,
            }}
          >
            {TAB_LABELS[tab]}
          </button>
        ))}
      </div>

      <div style={{ marginBottom: 8, fontSize: 12, color: "#888" }}>
        <span style={{ color: ENDPOINTS[activeTab].method === "GET" ? "#0f0" : "#16a34a" }}>
          {ENDPOINTS[activeTab].method}
        </span>{" "}
        {API}{ENDPOINTS[activeTab].path}
      </div>

      {ENDPOINTS[activeTab].method !== "GET" && (
        <textarea
          value={inputs[activeTab]}
          onChange={e => setInputs(prev => ({ ...prev, [activeTab]: e.target.value }))}
          rows={14}
          style={{
            width: "100%",
            fontFamily: "monospace",
            background: "#111",
            color: "#fff",
            border: "1px solid #333",
            borderRadius: 6,
            padding: 12,
            boxSizing: "border-box",
            fontSize: 13,
          }}
        />
      )}

      <button
        onClick={send}
        disabled={loading}
        style={{
          marginTop: 8,
          padding: "10px 24px",
          background: loading ? "#333" : "#16a34a",
          color: loading ? "#666" : "#fff",
          border: "none",
          borderRadius: 6,
          cursor: loading ? "not-allowed" : "pointer",
          fontFamily: "monospace",
          fontWeight: 700,
          fontSize: 14,
        }}
      >
        {loading ? "Sending..." : "Send"}
      </button>

      <pre
        style={{
          background: "#111",
          color: "#0f0",
          padding: 16,
          marginTop: 16,
          minHeight: 200,
          overflow: "auto",
          borderRadius: 6,
          border: "1px solid #222",
          fontSize: 13,
        }}
      >
        {response || "// Response will appear here"}
      </pre>
    </div>
  );
}
