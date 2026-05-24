# Realtime Weather Forecasting & ML Classification

A full-stack weather forecasting application that fetches real-time data from OpenWeatherMap, processes live weather features, and runs a trained XGBoost classifier to predict weather conditions (Sunny · Cloudy · Rainy · Snowy) through a FastAPI microservice — displayed on a responsive, mobile-first dashboard built with Next.js 14.

---

## Architecture Overview

```
+---------------------------+   /api/weather    +--------------------------+
|                           | ----------------> |                          |
|   Next.js (Vercel)        |                   |   OpenWeatherMap API     |
|   TypeScript + Tailwind   | <---- JSON -----  |                          |
|   SWR + Recharts UI       |                   +--------------------------+
|                           |   /api/predict    +--------------------------+
|                           | ----------------> |   FastAPI Service        |
|                           | <---- JSON -----  |   XGBoost ML Model       |
+---------------------------+                   +--------------------------+
```

---

## Features

- Real-time weather data by city search
- 5-day / 3-hour forecast support
- ML-based weather condition classification
- XGBoost model trained on 13,200 labeled weather samples
- Prediction confidence scores and class probabilities
- Interactive temperature and precipitation trend charts
- Responsive mobile-first UI with glassmorphism design
- Settings drawer for location type and unit preferences

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, Recharts, SWR |
| Backend API | Next.js Route Handlers (serverless) |
| ML Training | Python 3.10+, scikit-learn, XGBoost, pandas, numpy |
| ML Serving | FastAPI, uvicorn |
| Deployment | Vercel (frontend) · Railway / Render (backend) |

---

## Prerequisites

Install the following before running the project:

- [Node.js 18+](https://nodejs.org)
- [Python 3.10+](https://python.org)
- [Git](https://git-scm.com)
- [VS Code](https://code.visualstudio.com) (recommended)
- OpenWeatherMap API key — [get one free here](https://openweathermap.org/api)

---

## Environment Variables

Create a `.env.local` file in the root of the project:

```env
OPENWEATHER_API_KEY=your_openweather_api_key_here
PYTHON_API_URL=http://localhost:8000
NEXT_PUBLIC_DEFAULT_CITY=Manila
```
+---------------------------+   /api/weather    +--------------------------+
|                           | ----------------> |                          |
|   Next.js (Vercel)        |                   |   OpenWeatherMap API     |
|   TypeScript + Tailwind   | <---- JSON -----  |                          |
|   SWR + Recharts UI       |                   +--------------------------+
|                           |   /api/predict    +--------------------------+
|                           | ----------------> |   FastAPI Service        |
|                           | <---- JSON -----  |   XGBoost ML Model       |
+---------------------------+                   +--------------------------+
```json
{
 "current": {
 "city": "Manila",
 "country": "PH",
 "temp": 31.2,
 "feelsLike": 38.1,
 "humidity": 78,
 "pressure": 1009,
 "windSpeed": 19.4,
 "cloudiness": 60,
 "description": "broken clouds",
 "icon": "04d"
 },
 "forecast": [ { "dt": 1716469200, "temp": 29.5, "pop": 0.6 } ],
 "mlFeatures": { "Temperature": 31.2, "Humidity": 78, "..." : "..." }
}
```

### `POST /api/predict`

Proxies ML features to the FastAPI server and returns a prediction.

**Request body:**
```json
{ "features": { "Temperature": 31.2, "Humidity": 78, "Wind Speed": 19.4, "..." : "..." } }
```

**Response:**
```json
{
 "label": "Rainy",
 "class_id": 2,
 "confidence": 0.87,
 "probabilities": { "Sunny": 0.02, "Cloudy": 0.08, "Rainy": 0.87, "Snowy": 0.03 }
}
```

**Fallback** (when FastAPI is offline):
```json
{ "label": null, "error": "ML service unavailable", "fallback": true }
```

---

## Dataset Information

| Property | Value |
|---|---|
| File | `weather_classification_data.csv` |
| Total rows | 13,200 |
| Class balance | Perfectly balanced — 3,300 rows per class |
| Target classes | Sunny · Cloudy · Rainy · Snowy |

### Feature Schema

| Feature | Type | Source |
|---|---|---|
| Temperature | float (°C) | OpenWeatherMap API |
| Humidity | float (%) | OpenWeatherMap API |
| Wind Speed | float (km/h) | OpenWeatherMap API |
| Precipitation (%) | float | OpenWeatherMap API |
| Cloud Cover | encoded int | OpenWeatherMap API |
| Atmospheric Pressure | float (hPa) | OpenWeatherMap API |
| UV Index | int | Estimated |
| Season | encoded int | Derived from month |
| Visibility (km) | float | OpenWeatherMap API |
| Location | encoded int | User selection |

---

## Project Structure

```
weather-forecast-app/
 src/
 app/
 layout.tsx
 page.tsx
 globals.css
 dashboard/
 page.tsx
 api/
 weather/route.ts
 predict/route.ts
 components/
 WeatherDashboard.tsx
 CurrentWeatherCard.tsx
 MLPredictionPanel.tsx
 HourlyForecastStrip.tsx
 WeeklyForecastList.tsx
 ForecastChart.tsx
 HourlyChart.tsx
 WeatherMetricsGrid.tsx
 WeatherConditionIcon.tsx
 LocationSearch.tsx
 AppFooter.tsx
 SettingsDrawer.tsx
 LoadingSkeleton.tsx
 lib/
 openweather.ts
 mlClient.ts
 featureExtractor.ts
 utils.ts
 hooks/
 useWeather.ts
 usePrediction.ts
 types/
 weather.ts
 ml.ts
 ml/
 api_server.py
 train.py
 predict.py
 evaluate.py
 requirements.txt
 weather_training.ipynb
 weather_classifier.pkl ← generated after training
 label_encoder.pkl ← generated after training
 feature_importance.json ← generated after training
 public/
 .env.local ← you create this (gitignored)
 .env.local.example
 package.json
 next.config.ts
 tailwind.config.ts
 tsconfig.json
 vercel.json
 README.md
```

---

## Troubleshooting

** "ML Offline" / ML service not working**
- Make sure FastAPI is running: `uvicorn api_server:app --reload --port 8000`
- Check `PYTHON_API_URL=http://localhost:8000` in your `.env.local`
- Test directly: `curl http://localhost:8000/health`

** "FileNotFoundError: weather_classifier.pkl not found"**
- The `.pkl` files must be inside the `ml/` folder, not the project root
- Run `ls ml/*.pkl` to verify their location

** "FileNotFoundError: weather_classification_data.csv" in Colab**
- You must upload the CSV file in each new Colab session (Files panel → Upload)
- The file disappears when the Colab runtime resets — re-upload if needed

** GridSearchCV is very slow in Colab**
- Go to **Runtime → Change runtime type → Hardware accelerator → GPU**
- This significantly speeds up training

** "ModuleNotFoundError: No module named 'xgboost'"**
- Make sure your virtual environment is activated — you should see `(venv)` in the terminal
- Run `pip install -r requirements.txt` again inside the `ml/` folder

** "Error: listen EADDRINUSE — Port 8000 already in use"**
```bash
# Mac / Linux
lsof -ti:8000 | xargs kill
# Windows (in PowerShell)
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```
Or change the port: `uvicorn api_server:app --port 8001` and update `PYTHON_API_URL` accordingly.

** Weather data not loading**
- Verify your `OPENWEATHER_API_KEY` in `.env.local` is correct
- New OpenWeatherMap accounts can take up to 2 hours to activate after registration

** Vercel build fails**
- Run `npm run build` locally first to catch TypeScript errors before pushing
- Fix all type errors, then push to GitHub again

---

## License

For educational and academic use only.

---

## Credits

- [OpenWeatherMap API](https://openweathermap.org/api) — Real-time weather data
- [XGBoost](https://xgboost.readthedocs.io) & [scikit-learn](https://scikit-learn.org) — ML model training
- [Next.js](https://nextjs.org) — Frontend framework
- [FastAPI](https://fastapi.tiangolo.com) — ML serving microservice
- [Vercel](https://vercel.com) — Frontend deployment

**Built by Alren Grampon**