---
name: energy-forecasting
version: 1.0.0
description: Statistical and ML-based energy forecasting for PV systems — day-ahead, intra-day, and seasonal forecasting using weather predictions, historical generation, and machine learning models.
author: SuryaPrajna Contributors
license: MIT
tags:
  - forecasting
  - machine-learning
  - time-series
  - day-ahead
  - energy-prediction
dependencies:
  python:
    - pvlib>=0.11.0
    - pandas>=2.0
    - numpy>=1.24
    - scikit-learn>=1.3
    - matplotlib>=3.7
    - scipy>=1.10
  data:
    - Historical generation data (minimum 1 year recommended)
    - Weather forecast data (NWP model output or weather API)
pack: pv-energy
agent: Phala-Agent
---

# energy-forecasting

Statistical and machine learning-based energy forecasting for PV systems. Supports day-ahead, intra-day, and seasonal forecasting horizons using numerical weather predictions, historical generation patterns, and ML models for grid scheduling, trading, and O&M planning.

## LLM Instructions

### Role Definition
You are a **PV energy forecasting specialist** with expertise in time-series analysis, machine learning for solar power prediction, and numerical weather prediction (NWP) post-processing. You understand grid operator requirements for day-ahead scheduling and can design forecasting pipelines from data ingestion to forecast delivery.

### Thinking Process
1. **Define forecast requirement** — Horizon (intra-day, day-ahead, week-ahead, seasonal), resolution, accuracy target
2. **Assess available data** — Historical generation, weather forecasts, SCADA data quality
3. **Select forecasting approach** — Physical model (pvlib + NWP), statistical (ARIMA, persistence), ML (Random Forest, LSTM, XGBoost)
4. **Feature engineering** — Solar position, clear-sky index, lagged generation, weather features, calendar features
5. **Train and validate** — Time-series cross-validation, avoid data leakage
6. **Evaluate accuracy** — RMSE, MAE, MBE, skill score vs. persistence
7. **Deploy and monitor** — Forecast pipeline, error tracking, model retraining schedule

### Output Format
- Start with **forecast specification**: horizon, resolution, evaluation period
- Provide **model summary**: approach, features, training period
- Include **accuracy metrics table**: RMSE, MAE, MBE, skill score (vs. persistence)
- Show **forecast vs. actual plot** for representative periods
- Provide **error distribution** histogram or box plot
- Include **working Python code** for the forecasting pipeline
- Specify model performance by weather condition (clear, partly cloudy, overcast)

### Quality Criteria
- [ ] Forecast skill score > 0 vs. persistence (model adds value)
- [ ] nRMSE is within typical ranges (15-25% for day-ahead, 5-15% for intra-hour)
- [ ] No data leakage in train/test split (future data not used for training)
- [ ] Model is evaluated on out-of-sample data
- [ ] Clear-sky and cloudy conditions are handled differently or separately evaluated
- [ ] Forecast timestamps and timezone are clearly specified

### Common Pitfalls
- **Do not** train and test on the same data period — always use proper time-series split
- **Do not** use future weather observations as forecast inputs — use NWP forecasts
- **Do not** ignore the naive persistence benchmark — always compare against it
- **Do not** report accuracy only on clear days — include cloudy/variable conditions
- **Do not** forget to re-train models periodically as plant performance changes
- **Do not** use LSTM/deep learning without sufficient data (> 1 year minimum)

## Capabilities

### 1. Persistence Forecasting
Baseline forecasts: smart persistence (yesterday's generation shifted to today's solar position), climatological persistence.

### 2. Physical Model Forecasting
Use pvlib with NWP weather forecasts (GFS, ECMWF, WRF) to generate physics-based power forecasts.

### 3. Statistical Forecasting
ARIMA/SARIMAX, exponential smoothing, and regression models using historical generation and weather data.

### 4. Machine Learning Forecasting
Random Forest, Gradient Boosting (XGBoost/LightGBM), Support Vector Regression, and LSTM neural networks for non-linear power prediction.

### 5. Ensemble Forecasting
Combine multiple models (physical + statistical + ML) using weighted averaging or stacking for improved accuracy.

### 6. Probabilistic Forecasting
Generate prediction intervals and quantile forecasts for risk-aware decision making.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `capacity_kwp` | float | Yes | System DC capacity in kWp |
| `latitude` | float | Yes | Site latitude in decimal degrees |
| `longitude` | float | Yes | Site longitude in decimal degrees |
| `historical_data` | file | Yes | Historical generation data (timestamp, power_kw) |
| `weather_forecast` | file | No | NWP forecast data (GHI, temperature, cloud cover) |
| `forecast_horizon` | string | No | "intra-day", "day-ahead", "week-ahead", "seasonal" (default: "day-ahead") |
| `resolution_minutes` | int | No | Forecast time resolution in minutes (default: 60) |
| `model_type` | string | No | "persistence", "physical", "arima", "random_forest", "xgboost", "lstm", "ensemble" (default: "random_forest") |
| `training_period` | string | No | Training data period, e.g., "2023-01-01/2024-12-31" |
| `test_period` | string | No | Test/evaluation period |

## Example Usage

### Day-Ahead Forecast

```
Prompt: "Build a day-ahead energy forecast model for a 10 MWp plant using
2 years of historical SCADA data and GFS weather forecasts. Use Random Forest
with proper time-series cross-validation."
```

### Example Code

```python
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error
import pvlib

# Load historical data
data = pd.read_csv('scada_data.csv', parse_dates=['timestamp'], index_col='timestamp')

# Feature engineering
location = pvlib.location.Location(latitude=17.4, longitude=78.5, tz='Asia/Kolkata')
solar_pos = location.get_solarposition(data.index)
clearsky = location.get_clearsky(data.index)

data['solar_elevation'] = solar_pos['elevation']
data['clearsky_ghi'] = clearsky['ghi']
data['clear_sky_index'] = data['ghi'] / clearsky['ghi'].clip(lower=1)
data['hour'] = data.index.hour
data['month'] = data.index.month
data['day_of_year'] = data.index.dayofyear

# Features and target
features = ['solar_elevation', 'clearsky_ghi', 'clear_sky_index',
            'ghi_forecast', 'temp_forecast', 'hour', 'month']
target = 'power_kw'

# Time-series split (no data leakage)
train = data[:'2024-06']
test = data['2024-07':]

X_train, y_train = train[features], train[target]
X_test, y_test = test[features], test[target]

# Train Random Forest
model = RandomForestRegressor(n_estimators=200, max_depth=15, random_state=42)
model.fit(X_train, y_train)

# Evaluate
y_pred = model.predict(X_test)
rmse = np.sqrt(mean_squared_error(y_test, y_pred))
mae = mean_absolute_error(y_test, y_pred)
nrmse = rmse / data[target].mean() * 100

# Persistence benchmark
y_persist = y_test.shift(24 * 1)  # 24h persistence
rmse_persist = np.sqrt(mean_squared_error(y_test.dropna(), y_persist.dropna()))
skill_score = 1 - rmse / rmse_persist

print(f"RMSE: {rmse:.1f} kW | nRMSE: {nrmse:.1f}% | Skill Score: {skill_score:.2f}")
```

## Output Format

The skill produces:
- **Model summary**: Type, features, training period, hyperparameters
- **Accuracy metrics**: RMSE, MAE, MBE, nRMSE (%), skill score vs. persistence
- **Forecast vs. actual plot**: Time-series comparison for test period
- **Error distribution**: Histogram and statistics of forecast errors
- **Feature importance**: Ranked list of most predictive features
- **Performance by condition**: Accuracy split by clear/cloudy/overcast

## Standards & References

- IEA PVPS Task 16: Solar resource and forecast evaluation
- IEC 62724: PV power forecasting
- Lorenz et al. (2009): Regional PV power prediction for grid integration
- Yang et al. (2018): Verification framework for solar forecasting

## Related Skills

- `pvlib-analysis` — Physical model-based forecasting engine
- `weather-data-ingestion` — NWP data retrieval
- `pr-monitoring` — Historical performance data for training
- `energy-yield` — Baseline yield for forecast benchmarking
