# 🌤️ Realtime Weather Forecasting & ML Classification

A full-stack weather app that fetches real-time conditions from OpenWeatherMap, runs an XGBoost classifier on the live readings, and shows the result on a polished mobile-first dashboard.

> **Architecture in one glance**
> ```
> ┌──────────────────────┐    /api/weather    ┌──────────────────────┐
> │  Next.js 14 (Vercel) │ ─────────────────▶ │  OpenWeatherMap API  │
> │  TypeScript + Tailwind│ ◀───── JSON ────── └──────────────────────┘
> │  Recharts · SWR · UI │
> │                      │    /api/predict    ┌──────────────────────┐
> │                      │ ─────────────────▶ │  FastAPI (Railway)   │
> │                      │ ◀──── JSON ─────── │  XGBoost + sklearn   │
> └──────────────────────┘                    └──────────────────────┘
> ```

---

## 1 · Project Overview

What the app does:

1. The user searches any city worldwide.
2. The Next.js backend calls OpenWeatherMap (current weather + 5-day / 3-hour forecast).
3. The same backend extracts the 10-feature vector the ML model needs.
4. Those features are posted to a Python FastAPI microservice running a trained XGBoost classifier.
5. The dashboard shows the live conditions, a temperature trend chart, a precipitation chart, the ML label with confidence and per-class probabilities, an 8-tile metrics grid, and a 5-day forecast list.

**Tech stack**

| Layer       | Stack |
|-------------|-------|
| Frontend    | Next.js 14 App Router, TypeScript (strict), Tailwind v3, Recharts, SWR, lucide-react |
| Backend API | Next.js Route Handlers (`/api/weather`, `/api/predict`) |
| ML training | scikit-learn + XGBoost, trained in Google Colab |
| ML serving  | FastAPI + uvicorn, loaded from `joblib` `.pkl` |
| Hosting     | Vercel (Next.js) + Railway or Render (FastAPI) |

---

## 2 · Prerequisites

You need these installed once:

- **Node.js 18+** — https://nodejs.org
- **Python 3.10+** — https://python.org
- **VS Code** — https://code.visualstudio.com
- **Git** — https://git-scm.com
- A free **Google account** (for Google Colab)
- An **OpenWeatherMap API key** — `OPENWEATHER_API_KEY=YOUR_API_KEY` is already wired into `.env.local.example`. You can also create your own free key at https://openweathermap.org/api.

---

## 3 · VS Code · Clone & Install the Project

```bash
# 1. Open VS Code terminal (Ctrl+` or View → Terminal)

# 2. Clone the project (or unzip if you have the zip file)
git clone https://github.com/your-username/weather-forecast-app.git
cd weather-forecast-app

# 3. Install Node dependencies
npm install

# 4. Create your environment file
cp .env.local.example .env.local
# Open .env.local in VS Code and confirm the API key is filled in.

# 5. Start the development server
npm run dev
# Open http://localhost:3000
# The app loads with live weather data. The ML panel will say
# "ML service offline" until you finish Section 5.
```

---

## 4 · Google Colab · Train the ML Model

You will train the XGBoost classifier in Colab (free GPU) and download three artifact files into `ml/`.

```
Step 1: Go to https://colab.research.google.com
Step 2: Click "New Notebook" (top left)
Step 3: Upload the dataset
        - Click the Files icon in the left sidebar (folder icon)
        - Click the Upload button (page with arrow icon)
        - Select weather_classification_data.csv from your project's ml/ folder
        - Wait for it to appear in the file tree.

Step 4: Copy each code cell below into the Colab notebook
        - Click "+ Code" at the top to add a new cell, paste, repeat.
        - The cells are CELL 1 → CELL 9 below.

Step 5: Run all cells
        - Runtime → Run all  (or Shift+Enter on each cell)

Step 6: Wait for CELL 7 (GridSearchCV) — 5 to 15 minutes.
        For a faster run: Runtime → Change runtime type → T4 GPU.

Step 7: When CELL 9 finishes, 3 files auto-download to your computer:
          weather_classifier.pkl
          label_encoder.pkl
          feature_importance.json

Step 8: Move all 3 files into your project's ml/ folder.
```

> **Shortcut:** the repo also ships with `ml/weather_training.ipynb` containing all 9 cells. Open Colab → File → Upload notebook → pick that file → Runtime → Run all.

### CELL 1 — Title & Instructions (Markdown)

```markdown
# 🌤️ Weather Classification Model — Training Notebook
## Setup Instructions
1. Upload `weather_classification_data.csv` using the Files panel (left sidebar)
2. Run each cell top to bottom (Shift+Enter), OR Runtime → Run All
3. After Cell 8 completes, your files auto-download:
   - `weather_classifier.pkl`
   - `label_encoder.pkl`
   - `feature_importance.json`
4. Place all 3 downloaded files inside your project's `ml/` folder
```

### CELL 2 — Install Dependencies

```python
!pip install xgboost==2.0.3 scikit-learn==1.4.2 pandas==2.2.2 \
            numpy==1.26.4 joblib==1.4.2 matplotlib==3.8.4 seaborn==0.13.2
print("✅ All packages installed")
```

### CELL 3 — Imports

```python
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import json
import joblib
from sklearn.model_selection import train_test_split, GridSearchCV, cross_val_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import (accuracy_score, classification_report,
                              confusion_matrix, ConfusionMatrixDisplay)
from xgboost import XGBClassifier
print("✅ Imports complete")
```

### CELL 4 — Load & Validate Dataset

```python
df = pd.read_csv('weather_classification_data.csv')
print(f"✅ Dataset loaded: {df.shape[0]} rows × {df.shape[1]} columns")
print("\n📊 Column names:")
print(df.columns.tolist())
print("\n📊 First 5 rows:")
display(df.head())
print("\n📊 Class distribution:")
print(df['Weather Type'].value_counts())
print("\n📊 Missing values:")
print(df.isnull().sum())
print("\n📊 Data types:")
print(df.dtypes)
```

### CELL 5 — Exploratory Data Analysis

```python
fig, axes = plt.subplots(2, 3, figsize=(16, 10))
fig.suptitle('Weather Dataset — Feature Distributions', fontsize=16, fontweight='bold')

# Temperature distribution by class
for weather_type in df['Weather Type'].unique():
    subset = df[df['Weather Type'] == weather_type]
    axes[0,0].hist(subset['Temperature'], alpha=0.6, label=weather_type, bins=30)
axes[0,0].set_title('Temperature by Weather Type')
axes[0,0].legend()

# Humidity
for weather_type in df['Weather Type'].unique():
    subset = df[df['Weather Type'] == weather_type]
    axes[0,1].hist(subset['Humidity'], alpha=0.6, label=weather_type, bins=30)
axes[0,1].set_title('Humidity by Weather Type')
axes[0,1].legend()

# Wind Speed
for weather_type in df['Weather Type'].unique():
    subset = df[df['Weather Type'] == weather_type]
    axes[0,2].hist(subset['Wind Speed'], alpha=0.6, label=weather_type, bins=30)
axes[0,2].set_title('Wind Speed by Weather Type')
axes[0,2].legend()

# Class distribution pie
class_counts = df['Weather Type'].value_counts()
axes[1,0].pie(class_counts.values, labels=class_counts.index, autopct='%1.1f%%',
              colors=['#fbbf24','#94a3b8','#60a5fa','#e0e7ff'])
axes[1,0].set_title('Class Distribution')

# Cloud Cover counts
cloud_counts = df.groupby(['Cloud Cover', 'Weather Type']).size().unstack(fill_value=0)
cloud_counts.plot(kind='bar', ax=axes[1,1], colormap='viridis')
axes[1,1].set_title('Cloud Cover vs Weather Type')
axes[1,1].tick_params(axis='x', rotation=30)

# Correlation heatmap (numeric only)
numeric_cols = ['Temperature','Humidity','Wind Speed','Precipitation (%)',
                'Atmospheric Pressure','UV Index','Visibility (km)']
corr = df[numeric_cols].corr()
sns.heatmap(corr, ax=axes[1,2], annot=True, fmt='.2f', cmap='coolwarm', linewidths=0.5)
axes[1,2].set_title('Feature Correlation Matrix')

plt.tight_layout()
plt.savefig('eda_plots.png', dpi=150, bbox_inches='tight')
plt.show()
print("✅ EDA complete — plot saved as eda_plots.png")
```

### CELL 6 — Feature Engineering & Encoding

```python
df_encoded = df.copy()

# Encode Cloud Cover
cloud_cover_map = {'clear': 0, 'partly cloudy': 1, 'cloudy': 2, 'overcast': 3}
df_encoded['Cloud Cover'] = df_encoded['Cloud Cover'].map(cloud_cover_map)

# Encode Season
season_map = {'Spring': 0, 'Summer': 1, 'Autumn': 2, 'Winter': 3}
df_encoded['Season'] = df_encoded['Season'].map(season_map)

# Encode Location
location_map = {'inland': 0, 'coastal': 1, 'mountain': 2}
df_encoded['Location'] = df_encoded['Location'].map(location_map)

# Encode target
target_map = {'Sunny': 0, 'Cloudy': 1, 'Rainy': 2, 'Snowy': 3}
target_map_inverse = {v: k for k, v in target_map.items()}
df_encoded['Weather Type'] = df_encoded['Weather Type'].map(target_map)

# Save encoding dictionaries (used by FastAPI to decode predictions)
label_encoders = {
    'cloud_cover': cloud_cover_map,
    'season': season_map,
    'location': location_map,
    'weather_type': target_map,
    'weather_type_inverse': target_map_inverse,
}

FEATURE_COLS = [
    'Temperature', 'Humidity', 'Wind Speed', 'Precipitation (%)',
    'Cloud Cover', 'Atmospheric Pressure', 'UV Index', 'Season',
    'Visibility (km)', 'Location'
]
TARGET_COL = 'Weather Type'

X = df_encoded[FEATURE_COLS]
y = df_encoded[TARGET_COL]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, stratify=y, random_state=42
)

print(f"✅ Feature engineering complete")
print(f"   Training samples : {X_train.shape[0]}")
print(f"   Test samples     : {X_test.shape[0]}")
print(f"   Features         : {FEATURE_COLS}")
print(f"\nEncoding maps saved: {list(label_encoders.keys())}")
```

### CELL 7 — Train XGBoost with GridSearchCV

```python
print("🔄 Building pipeline and running GridSearchCV...")
print("   This may take 5–15 minutes depending on Colab GPU/CPU...\n")

pipeline = Pipeline([
    ('scaler', StandardScaler()),
    ('xgb', XGBClassifier(
        eval_metric='mlogloss',
        random_state=42,
        use_label_encoder=False,
    )),
])

param_grid = {
    'xgb__n_estimators': [100, 200, 300],
    'xgb__max_depth': [4, 6, 8],
    'xgb__learning_rate': [0.05, 0.1, 0.2],
    'xgb__subsample': [0.8, 1.0],
}

grid_search = GridSearchCV(
    pipeline,
    param_grid,
    cv=5,
    scoring='accuracy',
    n_jobs=-1,
    verbose=2,
)

grid_search.fit(X_train, y_train)

best_pipeline = grid_search.best_estimator_
print(f"\n✅ Training complete!")
print(f"   Best params : {grid_search.best_params_}")
print(f"   Best CV acc : {grid_search.best_score_:.4f} ({grid_search.best_score_*100:.2f}%)")
```

### CELL 8 — Evaluate Model

```python
y_pred = best_pipeline.predict(X_test)
test_accuracy = accuracy_score(y_test, y_pred)

print("=" * 55)
print(f"  TEST ACCURACY: {test_accuracy:.4f} ({test_accuracy*100:.2f}%)")
print("=" * 55)
print("\n📊 Classification Report:")
class_names = ['Sunny', 'Cloudy', 'Rainy', 'Snowy']
print(classification_report(y_test, y_pred, target_names=class_names))

# Confusion Matrix
fig, axes = plt.subplots(1, 2, figsize=(14, 5))

cm = confusion_matrix(y_test, y_pred)
disp = ConfusionMatrixDisplay(confusion_matrix=cm, display_labels=class_names)
disp.plot(ax=axes[0], cmap='Blues', colorbar=False)
axes[0].set_title(f'Confusion Matrix\nTest Accuracy: {test_accuracy*100:.2f}%', fontsize=13)

# Feature Importances
xgb_model = best_pipeline.named_steps['xgb']
importances = xgb_model.feature_importances_
feat_imp = pd.Series(importances, index=FEATURE_COLS).sort_values(ascending=True)
feat_imp.plot(kind='barh', ax=axes[1], color='#6c63ff')
axes[1].set_title('Feature Importances (XGBoost)', fontsize=13)
axes[1].set_xlabel('Importance Score')

plt.tight_layout()
plt.savefig('evaluation_plots.png', dpi=150, bbox_inches='tight')
plt.show()

# Cross-validation
cv_scores = cross_val_score(best_pipeline, X, y, cv=5, scoring='accuracy')
print(f"\n📊 5-Fold Cross-Validation: {cv_scores.mean():.4f} ± {cv_scores.std():.4f}")
print(f"   Individual folds: {[f'{s:.4f}' for s in cv_scores]}")
```

### CELL 9 — Save Model & Auto-Download

```python
from google.colab import files

# Save pipeline
joblib.dump(best_pipeline, 'weather_classifier.pkl')
print("✅ Saved: weather_classifier.pkl")

# Save label encoders
joblib.dump(label_encoders, 'label_encoder.pkl')
print("✅ Saved: label_encoder.pkl")

# Save feature importances as JSON
xgb_model = best_pipeline.named_steps['xgb']
feat_importance_dict = {
    col: float(imp)
    for col, imp in sorted(
        zip(FEATURE_COLS, xgb_model.feature_importances_),
        key=lambda x: x[1], reverse=True
    )
}
with open('feature_importance.json', 'w') as f:
    json.dump(feat_importance_dict, f, indent=2)
print("✅ Saved: feature_importance.json")

# Auto-download all 3 files
print("\n📥 Downloading files to your computer...")
files.download('weather_classifier.pkl')
files.download('label_encoder.pkl')
files.download('feature_importance.json')

print("\n🎉 Done! Place all 3 files in your project's ml/ folder.")
print(f"\n📊 Final Summary:")
print(f"   Model        : XGBoost (best params: {grid_search.best_params_})")
print(f"   Test Accuracy: {test_accuracy*100:.2f}%")
print(f"   CV Accuracy  : {cv_scores.mean()*100:.2f}% ± {cv_scores.std()*100:.2f}%")
print(f"   Classes      : {class_names}")
print(f"   Features     : {len(FEATURE_COLS)} features")
```

> Prefer training locally instead of Colab? Run `cd ml && python train.py`. It writes the same three artifact files into `ml/`.

---

## 5 · VS Code · Run the Python FastAPI Server

```bash
# Open a NEW terminal in VS Code (click the + icon in the terminal panel)

# 1. Navigate to the ml folder
cd ml

# 2. Create a Python virtual environment
python -m venv venv

# 3. Activate the virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# 4. Install Python dependencies
pip install -r requirements.txt

# 5. Verify your .pkl files are in the ml/ folder
ls -la *.pkl
# Should show: weather_classifier.pkl  label_encoder.pkl

# 6. Start the FastAPI server
uvicorn api_server:app --reload --host 0.0.0.0 --port 8000

# You should see:
# INFO:     Uvicorn running on http://0.0.0.0:8000
# INFO:     Application startup complete.

# 7. Test the API is working (open a 3rd terminal, or use a browser):
curl http://localhost:8000/health
# Should return: {"status":"ok","model_loaded":true,...}
```

You can also open http://localhost:8000/docs in your browser for an interactive Swagger UI.

---

## 6 · VS Code · Run the Full App

```bash
# Go back to your first terminal (the one running npm run dev).
# If it isn't running anymore, start it again:
npm run dev

# Now open http://localhost:3000
# You should see the full weather dashboard with:
# ✅ Real-time weather data from OpenWeatherMap
# ✅ ML predictions from your trained XGBoost model
# ✅ Hourly + weekly forecast
# ✅ Weather metrics grid
```

---

## 7 · Deploy to Vercel (the Next.js app)

```
Step 1: Push your project to GitHub
        git init
        git add .
        git commit -m "Initial commit"
        git remote add origin https://github.com/your-username/weather-forecast-app.git
        git push -u origin main

Step 2: Go to https://vercel.com and sign in with GitHub

Step 3: Click "New Project" → Import your GitHub repository

Step 4: Add Environment Variables (Environment Variables section):
        OPENWEATHER_API_KEY = YOUR_API_KEY_HERE
        PYTHON_API_URL      = (leave blank for now — set in Section 8)

Step 5: Click Deploy → wait ~2 minutes

Step 6: Your app is live at https://your-project.vercel.app
        (ML predictions will fall back gracefully until you finish Section 8.)
```

---

## 8 · Deploy the Python API to Railway

```
Step 1: Go to https://railway.app and sign in with GitHub

Step 2: Click "New Project" → "Deploy from GitHub repo" → select your repo

Step 3: Railway auto-detects Python. Set the start command:
        cd ml && uvicorn api_server:app --host 0.0.0.0 --port $PORT

Step 4: Add the .pkl files — either:
        Option A: Commit them to GitHub (simplest)
                  git add ml/weather_classifier.pkl ml/label_encoder.pkl
                  git commit -m "Add trained model files"
                  git push
        Option B: Use Railway volume storage (advanced)

Step 5: After deploy, copy your Railway URL (e.g. https://your-api.railway.app)

Step 6: In Vercel → your project → Settings → Environment Variables
        Update PYTHON_API_URL = https://your-api.railway.app
        Then Deployments tab → "Redeploy"

Step 7: Test your live app — ML predictions should now work on the deployed site.
```

> Render works identically: set the build command to `pip install -r ml/requirements.txt` and the start command to `cd ml && uvicorn api_server:app --host 0.0.0.0 --port $PORT`.

---

## 9 · Troubleshooting

```
❌ "ML service offline" on dashboard
   → Make sure uvicorn is running on port 8000 (Section 5)
   → Check PYTHON_API_URL in .env.local is http://localhost:8000

❌ "Cannot find module 'weather_classifier.pkl'"
   → Make sure you placed the .pkl files inside the ml/ folder (not project root)

❌ Colab "FileNotFoundError: weather_classification_data.csv"
   → You need to upload the CSV first (Files panel → Upload button in Colab)
   → The file disappears when the Colab session ends — re-upload if needed

❌ GridSearchCV takes too long in Colab
   → Runtime → Change runtime type → Hardware accelerator → T4 GPU
   → This significantly speeds up training

❌ "Module not found: xgboost" in VS Code terminal
   → Make sure your venv is activated (you should see (venv) in the prompt)
   → Run: pip install -r requirements.txt again

❌ Port 8000 already in use
   → Run: lsof -ti:8000 | xargs kill          (Mac/Linux)
   → Or change port: uvicorn api_server:app --port 8001
   → Update PYTHON_API_URL in .env.local to http://localhost:8001

❌ Weather data not loading
   → Check OPENWEATHER_API_KEY in .env.local is correct
   → Key: YOUR_API_KEY_HERE
   → Brand-new OWM accounts may take up to 2 hours to activate

❌ Vercel build fails
   → Run `npm run build` locally first to catch TypeScript errors
   → Fix all errors before pushing to GitHub
```

---

## 10 · Project Structure

```
weather-forecast-app/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                       redirect → /dashboard
│   │   ├── globals.css                    Tailwind + CSS vars + keyframes
│   │   ├── dashboard/page.tsx
│   │   └── api/
│   │       ├── weather/route.ts           GET  /api/weather
│   │       └── predict/route.ts           POST /api/predict
│   ├── components/
│   │   ├── WeatherDashboard.tsx           main orchestrator
│   │   ├── LocationSearch.tsx             Pick Location overlay
│   │   ├── CurrentWeatherCard.tsx         hero card + particles
│   │   ├── MLPredictionPanel.tsx          label + confidence + probs
│   │   ├── HourlyForecastStrip.tsx
│   │   ├── WeeklyForecastList.tsx
│   │   ├── ForecastChart.tsx              Recharts area (temp)
│   │   ├── HourlyChart.tsx                Recharts bar (precip)
│   │   ├── WeatherMetricsGrid.tsx
│   │   ├── WeatherConditionIcon.tsx       animated SVG illustrations
│   │   ├── BottomNav.tsx                  mobile bar + FAB
│   │   └── LoadingSkeleton.tsx
│   ├── lib/                openweather.ts · mlClient.ts · featureExtractor.ts · utils.ts
│   ├── hooks/              useWeather.ts · usePrediction.ts
│   └── types/              weather.ts · ml.ts
├── ml/
│   ├── weather_classification_data.csv    13,200 rows, 11 columns
│   ├── weather_training.ipynb             ready-to-run Colab notebook
│   ├── train.py                           local training (mirrors notebook)
│   ├── predict.py                         CLI sanity check
│   ├── evaluate.py                        re-evaluate saved model
│   ├── api_server.py                      FastAPI serving
│   └── requirements.txt
├── public/favicon.ico
├── .env.local.example
├── vercel.json
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## 11 · ML Feature Mapping

The 10-feature vector posted to `/predict` is built by `src/lib/featureExtractor.ts`. Each feature maps directly to OpenWeatherMap data or to a user-controlled choice:

| Feature                | Source                                          | Notes |
|------------------------|-------------------------------------------------|-------|
| `Temperature`          | `main.temp` (°C)                                | We always fetch metric for the ML pass, even when the UI shows °F. |
| `Humidity`             | `main.humidity` (%)                             |       |
| `Wind Speed`           | `wind.speed` × 3.6 (m/s → km/h)                 |       |
| `Precipitation (%)`    | `clouds.all` as proxy                           | Per spec — the trained dataset uses 0..100 for this column too. |
| `Cloud Cover`          | `clouds.all` bucketed                           | 0–10→0, 11–40→1, 41–80→2, 81–100→3 |
| `Atmospheric Pressure` | `main.pressure` (hPa)                           |       |
| `UV Index`             | default 3                                       | OWM's free Current endpoint doesn't include UV; can be overridden. |
| `Season`               | from current month                              | Mar–May=0, Jun–Aug=1, Sep–Nov=2, Dec–Feb=3 |
| `Visibility (km)`      | `visibility` / 1000                             |       |
| `Location`             | user choice in the Pick Location overlay         | inland=0, coastal=1, mountain=2 |

---

## 12 · License & Credits

- Weather data — [OpenWeatherMap](https://openweathermap.org/) (API key included for demo use).
- Icons — [lucide-react](https://lucide.dev/).
- Fonts — [Nunito](https://fonts.google.com/specimen/Nunito) and [Space Mono](https://fonts.google.com/specimen/Space+Mono) (Google Fonts).
- Dataset — bundled `weather_classification_data.csv` (13,200 rows, 11 columns, 4 balanced classes).
