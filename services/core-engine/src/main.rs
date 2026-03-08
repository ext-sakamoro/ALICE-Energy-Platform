use axum::{extract::State, response::Json, routing::{get, post}, Router};
use serde::{Deserialize, Serialize};
use std::sync::{Arc, Mutex};
use std::time::Instant;
use tower_http::cors::{Any, CorsLayer};
use tower_http::trace::TraceLayer;

struct AppState { start_time: Instant, stats: Mutex<Stats> }
struct Stats { total_simulations: u64, total_predictions: u64, total_optimizations: u64, kwh_simulated: f64 }

#[derive(Serialize)]
struct Health { status: String, version: String, uptime_secs: u64, total_ops: u64 }

#[derive(Deserialize)]
struct GridSimRequest { nodes: Option<u32>, duration_hours: Option<f64>, load_profile: Option<String>, renewable_pct: Option<f64> }
#[derive(Serialize)]
struct GridSimResponse { sim_id: String, nodes: u32, duration_hours: f64, total_generation_kwh: f64, total_consumption_kwh: f64, renewable_pct: f64, grid_stability: f64, peak_load_kw: f64, min_load_kw: f64, elapsed_us: u128 }

#[derive(Deserialize)]
struct BatteryPredictRequest { battery_type: Option<String>, capacity_kwh: Option<f64>, cycles_completed: Option<u32>, temperature_c: Option<f64> }
#[derive(Serialize)]
struct BatteryPredictResponse { prediction_id: String, battery_type: String, current_soh_pct: f64, predicted_eol_cycles: u32, remaining_cycles: u32, degradation_rate_per_cycle: f64, optimal_soc_range: [f64; 2], elapsed_us: u128 }

#[derive(Deserialize)]
struct DemandForecastRequest { region: Option<String>, horizon_hours: Option<u32>, granularity_mins: Option<u32> }
#[derive(Serialize)]
struct DemandForecastResponse { forecast_id: String, region: String, horizon_hours: u32, data_points: Vec<ForecastPoint>, peak_demand_kw: f64, min_demand_kw: f64, confidence: f64, elapsed_us: u128 }
#[derive(Serialize)]
struct ForecastPoint { hour: u32, demand_kw: f64, temperature_c: f64, solar_generation_kw: f64 }

#[derive(Deserialize)]
struct OptimizeRequest { objective: Option<String>, constraints: Option<serde_json::Value> }
#[derive(Serialize)]
struct OptimizeResponse { optimization_id: String, objective: String, cost_reduction_pct: f64, recommendations: Vec<String>, schedule: Vec<ScheduleEntry>, elapsed_us: u128 }
#[derive(Serialize)]
struct ScheduleEntry { hour: u32, action: String, amount_kw: f64, source: String }

#[derive(Serialize)]
struct StatsResponse { total_simulations: u64, total_predictions: u64, total_optimizations: u64, kwh_simulated: f64 }

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt().with_env_filter(tracing_subscriber::EnvFilter::try_from_default_env().unwrap_or_else(|_| "energy_engine=info".into())).init();
    let state = Arc::new(AppState { start_time: Instant::now(), stats: Mutex::new(Stats { total_simulations: 0, total_predictions: 0, total_optimizations: 0, kwh_simulated: 0.0 }) });
    let cors = CorsLayer::new().allow_origin(Any).allow_methods(Any).allow_headers(Any);
    let app = Router::new()
        .route("/health", get(health))
        .route("/api/v1/energy/grid/simulate", post(grid_simulate))
        .route("/api/v1/energy/battery/predict", post(battery_predict))
        .route("/api/v1/energy/demand/forecast", post(demand_forecast))
        .route("/api/v1/energy/optimize", post(optimize))
        .route("/api/v1/energy/stats", get(stats))
        .layer(cors).layer(TraceLayer::new_for_http()).with_state(state);
    let addr = std::env::var("ENERGY_ADDR").unwrap_or_else(|_| "0.0.0.0:8081".into());
    let listener = tokio::net::TcpListener::bind(&addr).await.unwrap();
    tracing::info!("Energy Engine on {addr}");
    axum::serve(listener, app).await.unwrap();
}

async fn health(State(s): State<Arc<AppState>>) -> Json<Health> {
    let st = s.stats.lock().unwrap();
    Json(Health { status: "ok".into(), version: env!("CARGO_PKG_VERSION").into(), uptime_secs: s.start_time.elapsed().as_secs(), total_ops: st.total_simulations + st.total_predictions })
}

async fn grid_simulate(State(s): State<Arc<AppState>>, Json(req): Json<GridSimRequest>) -> Json<GridSimResponse> {
    let t = Instant::now();
    let nodes = req.nodes.unwrap_or(100); let dur = req.duration_hours.unwrap_or(24.0);
    let renewable = req.renewable_pct.unwrap_or(35.0);
    let gen = dur * nodes as f64 * 10.0; let cons = gen * 0.92;
    { let mut st = s.stats.lock().unwrap(); st.total_simulations += 1; st.kwh_simulated += gen; }
    Json(GridSimResponse { sim_id: uuid::Uuid::new_v4().to_string(), nodes, duration_hours: dur, total_generation_kwh: gen, total_consumption_kwh: cons, renewable_pct: renewable, grid_stability: 0.98, peak_load_kw: cons / dur * 1.4, min_load_kw: cons / dur * 0.6, elapsed_us: t.elapsed().as_micros() })
}

async fn battery_predict(State(s): State<Arc<AppState>>, Json(req): Json<BatteryPredictRequest>) -> Json<BatteryPredictResponse> {
    let t = Instant::now();
    let btype = req.battery_type.unwrap_or_else(|| "li-ion-nmc".into());
    let capacity = req.capacity_kwh.unwrap_or(100.0);
    let cycles = req.cycles_completed.unwrap_or(500);
    let temp = req.temperature_c.unwrap_or(25.0);
    let degradation = 0.02 + (temp - 25.0).abs() * 0.001;
    let soh = (100.0 - cycles as f64 * degradation).max(0.0);
    let eol_cycles = (80.0 / degradation) as u32;
    let remaining = eol_cycles.saturating_sub(cycles);
    s.stats.lock().unwrap().total_predictions += 1;
    Json(BatteryPredictResponse { prediction_id: uuid::Uuid::new_v4().to_string(), battery_type: btype, current_soh_pct: soh, predicted_eol_cycles: eol_cycles, remaining_cycles: remaining, degradation_rate_per_cycle: degradation, optimal_soc_range: [20.0, 80.0], elapsed_us: t.elapsed().as_micros() })
}

async fn demand_forecast(State(s): State<Arc<AppState>>, Json(req): Json<DemandForecastRequest>) -> Json<DemandForecastResponse> {
    let t = Instant::now();
    let region = req.region.unwrap_or_else(|| "us-east".into());
    let hours = req.horizon_hours.unwrap_or(24);
    let h = fnv1a(region.as_bytes());
    let base = 5000.0 + (h % 5000) as f64;
    let points: Vec<ForecastPoint> = (0..hours).map(|hr| {
        let factor = 1.0 + 0.3 * ((hr as f64 * std::f64::consts::PI / 12.0).sin());
        ForecastPoint { hour: hr, demand_kw: base * factor, temperature_c: 20.0 + 5.0 * ((hr as f64 * std::f64::consts::PI / 12.0).sin()), solar_generation_kw: if hr >= 6 && hr <= 18 { base * 0.2 * ((hr as f64 - 6.0) * std::f64::consts::PI / 12.0).sin() } else { 0.0 } }
    }).collect();
    let peak = points.iter().map(|p| p.demand_kw).fold(0.0f64, f64::max);
    let min = points.iter().map(|p| p.demand_kw).fold(f64::MAX, f64::min);
    s.stats.lock().unwrap().total_predictions += 1;
    Json(DemandForecastResponse { forecast_id: uuid::Uuid::new_v4().to_string(), region, horizon_hours: hours, data_points: points, peak_demand_kw: peak, min_demand_kw: min, confidence: 0.92, elapsed_us: t.elapsed().as_micros() })
}

async fn optimize(State(s): State<Arc<AppState>>, Json(req): Json<OptimizeRequest>) -> Json<OptimizeResponse> {
    let t = Instant::now();
    let obj = req.objective.unwrap_or_else(|| "minimize-cost".into());
    let schedule: Vec<ScheduleEntry> = (0..24).map(|h| ScheduleEntry { hour: h, action: if h >= 10 && h <= 16 { "discharge-battery".into() } else if h >= 1 && h <= 5 { "charge-battery".into() } else { "grid-supply".into() }, amount_kw: 1000.0, source: if h >= 10 && h <= 16 { "solar+battery".into() } else { "grid".into() } }).collect();
    s.stats.lock().unwrap().total_optimizations += 1;
    Json(OptimizeResponse { optimization_id: uuid::Uuid::new_v4().to_string(), objective: obj, cost_reduction_pct: 18.5, recommendations: vec!["Shift charging to off-peak hours".into(), "Increase solar capacity by 20%".into(), "Deploy battery storage at substation 3".into()], schedule, elapsed_us: t.elapsed().as_micros() })
}

async fn stats(State(s): State<Arc<AppState>>) -> Json<StatsResponse> {
    let st = s.stats.lock().unwrap();
    Json(StatsResponse { total_simulations: st.total_simulations, total_predictions: st.total_predictions, total_optimizations: st.total_optimizations, kwh_simulated: st.kwh_simulated })
}

fn fnv1a(data: &[u8]) -> u64 { let mut h: u64 = 0xcbf2_9ce4_8422_2325; for &b in data { h ^= b as u64; h = h.wrapping_mul(0x0100_0000_01b3); } h }
