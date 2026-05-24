# Realtime Weather Forecasting and Machine Learning Classification

A full-stack weather forecasting application that fetches real-time weather data from OpenWeatherMap, processes live features, and runs a trained XGBoost classifier to predict weather conditions through a FastAPI microservice. The results are displayed on a responsive, mobile-first dashboard built with Next.js.

---

## Architecture Overview


┌──────────────────────────┐ /api/weather ┌──────────────────────────┐
│ Next.js (Vercel) │ ───────────────────▶ │ OpenWeatherMap API │
│ TypeScript + Tailwind │ ◀──── JSON ──────── │ │
│ SWR + Recharts UI │ └──────────────────────────┘
│ │ /api/predict ┌──────────────────────────┐
│ │ ───────────────────▶ │ FastAPI Service │
│ │ ◀──── JSON ──────── │ XGBoost Model │
└──────────────────────────┘ └──────────────────────────┘


---

## Features

- Real-time weather data by city search
- 5-day / 3-hour forecast support
- Machine learning-based weather classification
- XGBoost model trained on historical weather dataset
- Live prediction confidence scores and probabilities
- Interactive charts (temperature and precipitation trends)
- Responsive mobile-first UI dashboard

---

## Tech Stack

| Layer        | Technology |
|--------------|------------|
| Frontend     | Next.js 14, TypeScript, Tailwind CSS, Recharts, SWR |
| Backend API  | Next.js Route Handlers |
| ML Model     | Python, scikit-learn, XGBoost |
| ML Serving   | FastAPI, uvicorn |
| Deployment   | Vercel (frontend), Railway/Render (backend) |

---

## Prerequisites

Install the following before running the project:

- Node.js 18+
- Python 3.10+
- Git
- VS Code (recommended)
- OpenWeatherMap API key

---

## Environment Variables

Create a `.env.local` file in the root directory:

```env
OPENWEATHER_API_KEY=your_openweather_api_key
PYTHON_API_URL=http://localhost:8000

⚠️ Never expose or commit API keys to GitHub or any public repository.

Installation
git clone https://github.com/your-username/weather-forecast-app.git
cd weather-forecast-app

npm install

cp .env.local.example .env.local

npm run dev

Open the app in your browser:

http://localhost:3000
ML Model Training (Google Colab)
Open Google Colab
Upload weather_classification_data.csv
Run the provided notebook cells sequentially
After training, download the following files:
weather_classifier.pkl
label_encoder.pkl
feature_importance.json
Place all files inside the ml/ directory
Running the FastAPI Service
cd ml

python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt

uvicorn api_server:app --reload --host 0.0.0.0 --port 8000

API documentation:

http://localhost:8000/docs
Running the Full Stack App
Start FastAPI server (port 8000)
Start Next.js frontend:
npm run dev
Open:
http://localhost:3000
Deployment
Frontend (Vercel)
Push project to GitHub
Import repository in Vercel
Add environment variables:
OPENWEATHER_API_KEY
PYTHON_API_URL
Backend (Railway / Render)

Start command:

cd ml && uvicorn api_server:app --host 0.0.0.0 --port $PORT

Ensure these files are included:

weather_classifier.pkl
label_encoder.pkl
Troubleshooting
ML service not working
Ensure FastAPI is running on port 8000
Check PYTHON_API_URL in .env.local
Missing model files
Verify .pkl files exist in ml/ directory
Port already in use
lsof -i :8000
kill -9 <PID>
Weather data not loading
Check OpenWeatherMap API key
Ensure account is active
Vercel build failure
Run locally:
npm run build
Project Structure
weather-forecast-app/
├── src/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── hooks/
│   └── types/
├── ml/
│   ├── api_server.py
│   ├── train.py
│   ├── predict.py
│   ├── evaluate.py
│   ├── requirements.txt
│   └── weather_training.ipynb
├── public/
├── .env.local.example
├── package.json
├── next.config.ts
└── README.md
ML Feature Mapping
Feature	Source
Temperature	OpenWeather API
Humidity	OpenWeather API
Wind Speed	OpenWeather API
Cloud Cover	OpenWeather API
Pressure	OpenWeather API
Visibility	OpenWeather API
Season	Derived from month
Location Type	User selection
License

For educational and academic use only.

Credits
OpenWeatherMap API
XGBoost & scikit-learn
Next.js
FastAPI
Vercel

---

If you want next upgrades, I can also help you:
- :contentReference[oaicite:0]{index=0}
- :contentReference[oaicite:1]{index=1}
- or :contentReference[oaicite:2]{index=2}