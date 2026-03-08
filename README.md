# ALICE-Energy-Platform

Energy grid simulation platform with battery prediction, demand forecasting, and optimization.

## Architecture

```
Frontend (Next.js 15)          API Gateway (8081)
  /dashboard/console    →      POST /api/v1/energy/grid/simulate
  /                            POST /api/v1/energy/battery/predict
                               POST /api/v1/energy/demand/forecast
                               POST /api/v1/energy/optimize
                               GET  /api/v1/stats
                                        |
              +---------------------------+---------------------------+
              |               |           |               |           |
        Grid Simulator  Battery Engine  Demand Engine  Optimizer  Renewable Engine
        (load flow)     (LFP/NMC/NCA)  (LSTM+XGBoost) (MILP/GA)  (solar/wind)
              |               |           |               |           |
              +---------------------------+---------------------------+
                                        |
                              Time-Series Energy DB
                                        |
                             Weather & Market Data API
```

## Features

| Feature | Description |
|---------|-------------|
| Grid Simulation | High-fidelity power grid simulation with renewable source modeling and load flow |
| Battery Prediction | AI-powered degradation and SoC prediction for LFP, NMC, NCA chemistries |
| Demand Forecasting | Hybrid LSTM + XGBoost forecasting with weather integration, 30-min resolution |
| Multi-Objective Optimization | Optimize dispatch for cost, carbon, and reliability with Pareto analysis |
| Renewable Integration | Solar and wind modeling with curtailment and grid balancing strategies |
| Energy Analytics | Real-time grid health, carbon intensity, battery fleet, and market data |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /health | Health check |
| POST | /api/v1/energy/grid/simulate | Run grid simulation over a time window |
| POST | /api/v1/energy/battery/predict | Predict battery SoC and degradation |
| POST | /api/v1/energy/demand/forecast | Generate demand forecast for a region |
| POST | /api/v1/energy/optimize | Run multi-objective grid optimization |
| GET | /api/v1/stats | Platform statistics and metrics |

### POST /api/v1/energy/grid/simulate

```json
{
  "grid_id": "GRID-TOKYO-001",
  "simulation_window_hours": 24,
  "renewable_sources": [
    { "type": "solar", "capacity_mw": 500, "location": "kanto" },
    { "type": "wind",  "capacity_mw": 300, "location": "coastal" }
  ],
  "demand_baseline_mw": 8500,
  "weather_scenario": "summer_peak"
}
```

### POST /api/v1/energy/battery/predict

```json
{
  "battery_id": "BATT-STORAGE-001",
  "chemistry": "LFP",
  "capacity_kwh": 10000,
  "current_soc_pct": 75.0,
  "charge_cycles": 1200,
  "temperature_celsius": 25.0,
  "forecast_horizon_hours": 48
}
```

### POST /api/v1/energy/demand/forecast

```json
{
  "region": "kanto",
  "forecast_horizon_hours": 72,
  "resolution_minutes": 30,
  "include_weather": true,
  "include_holidays": true,
  "model": "hybrid_lstm_xgboost"
}
```

### POST /api/v1/energy/optimize

```json
{
  "grid_id": "GRID-TOKYO-001",
  "objective": "minimize_cost",
  "constraints": {
    "max_co2_kg_per_kwh": 0.3,
    "min_renewable_pct": 40,
    "battery_reserve_pct": 20
  },
  "time_horizon_hours": 24
}
```

## Quick Start

```bash
docker compose up -d
# API:      http://localhost:8081
# Frontend: http://localhost:3000
```

## License

AGPL-3.0-or-later
