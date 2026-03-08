export default function LandingPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0a0a0a, #0a2e0a)",
        color: "#fff",
        fontFamily: "system-ui",
      }}
    >
      <header
        style={{
          padding: "24px 48px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #ffffff10",
        }}
      >
        <h2 style={{ margin: 0, color: "#16a34a" }}>ALICE Energy-Platform</h2>
        <a href="/dashboard/console" style={{ color: "#16a34a", textDecoration: "none", fontWeight: 600 }}>
          Console →
        </a>
      </header>

      <main style={{ maxWidth: 960, margin: "0 auto", padding: "80px 24px", textAlign: "center" }}>
        <div
          style={{
            display: "inline-block",
            background: "#16a34a20",
            color: "#16a34a",
            borderRadius: 20,
            padding: "4px 16px",
            fontSize: 13,
            marginBottom: 24,
            border: "1px solid #16a34a40",
          }}
        >
          Grid Intelligence Platform
        </div>

        <h1 style={{ fontSize: 48, marginBottom: 16, lineHeight: 1.2 }}>
          Intelligent Energy Grid Simulation and Optimization
        </h1>
        <p style={{ fontSize: 20, color: "#aaa", marginBottom: 48, maxWidth: 600, margin: "0 auto 48px" }}>
          AI-driven grid simulation, battery degradation prediction, demand forecasting, and multi-objective optimization for modern energy networks.
        </p>

        <div style={{ display: "flex", gap: 16, justifyContent: "center", marginBottom: 80 }}>
          <a
            href="/dashboard/console"
            style={{
              padding: "12px 32px",
              background: "#16a34a",
              color: "#fff",
              borderRadius: 8,
              textDecoration: "none",
              fontWeight: 700,
              fontSize: 16,
            }}
          >
            Open Console
          </a>
          <a
            href="#features"
            style={{
              padding: "12px 32px",
              background: "#ffffff10",
              color: "#fff",
              borderRadius: 8,
              textDecoration: "none",
              fontWeight: 600,
              fontSize: 16,
              border: "1px solid #ffffff20",
            }}
          >
            Learn More
          </a>
        </div>

        <div
          id="features"
          style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, textAlign: "left" }}
        >
          <div style={{ background: "#ffffff10", borderRadius: 12, padding: 24, border: "1px solid #ffffff10" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>⚡</div>
            <h3 style={{ margin: "0 0 8px" }}>Grid Simulation</h3>
            <p style={{ color: "#aaa", margin: 0, fontSize: 14, lineHeight: 1.6 }}>
              High-fidelity power grid simulation with renewable source modeling, load flow analysis, and stability assessment over configurable time horizons.
            </p>
          </div>
          <div style={{ background: "#ffffff10", borderRadius: 12, padding: 24, border: "1px solid #ffffff10" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🔋</div>
            <h3 style={{ margin: "0 0 8px" }}>Battery Prediction</h3>
            <p style={{ color: "#aaa", margin: 0, fontSize: 14, lineHeight: 1.6 }}>
              AI-powered battery degradation and SoC prediction for LFP, NMC, and NCA chemistries with temperature and cycle-aware models.
            </p>
          </div>
          <div style={{ background: "#ffffff10", borderRadius: 12, padding: 24, border: "1px solid #ffffff10" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📈</div>
            <h3 style={{ margin: "0 0 8px" }}>Demand Forecasting</h3>
            <p style={{ color: "#aaa", margin: 0, fontSize: 14, lineHeight: 1.6 }}>
              Hybrid LSTM + XGBoost demand forecasting with weather integration, holiday calendars, and 30-minute resolution up to 7 days ahead.
            </p>
          </div>
          <div style={{ background: "#ffffff10", borderRadius: 12, padding: 24, border: "1px solid #ffffff10" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🎯</div>
            <h3 style={{ margin: "0 0 8px" }}>Multi-Objective Optimization</h3>
            <p style={{ color: "#aaa", margin: 0, fontSize: 14, lineHeight: 1.6 }}>
              Optimize grid dispatch for cost, carbon emissions, and reliability simultaneously with configurable constraint sets and Pareto front analysis.
            </p>
          </div>
          <div style={{ background: "#ffffff10", borderRadius: 12, padding: 24, border: "1px solid #ffffff10" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🌿</div>
            <h3 style={{ margin: "0 0 8px" }}>Renewable Integration</h3>
            <p style={{ color: "#aaa", margin: 0, fontSize: 14, lineHeight: 1.6 }}>
              Solar and wind generation modeling with curtailment analysis, grid balancing strategies, and renewable penetration scenario planning.
            </p>
          </div>
          <div style={{ background: "#ffffff10", borderRadius: 12, padding: 24, border: "1px solid #ffffff10" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📊</div>
            <h3 style={{ margin: "0 0 8px" }}>Energy Analytics</h3>
            <p style={{ color: "#aaa", margin: 0, fontSize: 14, lineHeight: 1.6 }}>
              Real-time grid health dashboards, carbon intensity tracking, battery fleet monitoring, and energy market price integration.
            </p>
          </div>
        </div>
      </main>

      <footer style={{ textAlign: "center", padding: 32, color: "#555", borderTop: "1px solid #ffffff10" }}>
        ALICE Energy-Platform — AGPL-3.0-or-later
      </footer>
    </div>
  );
}
