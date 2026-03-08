-- ALICE Energy Platform: Domain-specific tables
CREATE TABLE IF NOT EXISTS grid_simulations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    grid_name TEXT NOT NULL,
    node_count INTEGER NOT NULL DEFAULT 0,
    total_generation_mw DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    total_demand_mw DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    renewable_pct DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    frequency_hz DOUBLE PRECISION NOT NULL DEFAULT 50.0,
    stability_index DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    elapsed_ms BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS battery_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    battery_type TEXT NOT NULL DEFAULT 'li-ion' CHECK (battery_type IN ('li-ion', 'lifepo4', 'solid-state', 'flow', 'sodium-ion')),
    capacity_kwh DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    current_soc DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    cycle_count INTEGER NOT NULL DEFAULT 0,
    predicted_soh DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    predicted_remaining_cycles INTEGER NOT NULL DEFAULT 0,
    degradation_rate DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS demand_forecasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    region TEXT NOT NULL,
    forecast_start TIMESTAMPTZ NOT NULL,
    forecast_end TIMESTAMPTZ NOT NULL,
    peak_demand_mw DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    base_demand_mw DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    avg_demand_mw DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    confidence DOUBLE PRECISION NOT NULL DEFAULT 0.95,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_grid_simulations_user ON grid_simulations(user_id, created_at);
CREATE INDEX idx_battery_predictions_user ON battery_predictions(user_id, created_at);
CREATE INDEX idx_demand_forecasts_user ON demand_forecasts(user_id, created_at);
CREATE INDEX idx_demand_forecasts_region ON demand_forecasts(region, forecast_start);
