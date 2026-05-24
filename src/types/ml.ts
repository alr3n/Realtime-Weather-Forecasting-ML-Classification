// Types for the ML feature payload and prediction response.
// These MUST stay in lock-step with ml/api_server.py.

export interface MLFeatures {
  Temperature: number;            // °C
  Humidity: number;               // %
  'Wind Speed': number;           // km/h
  'Precipitation (%)': number;    // 0..100
  'Cloud Cover': number;          // 0=clear, 1=partly cloudy, 2=cloudy, 3=overcast
  'Atmospheric Pressure': number; // hPa
  'UV Index': number;             // 0..13
  Season: number;                 // 0=Spring, 1=Summer, 2=Autumn, 3=Winter
  'Visibility (km)': number;
  Location: number;               // 0=inland, 1=coastal, 2=mountain
}

export type MLLabel = 'Sunny' | 'Cloudy' | 'Rainy' | 'Snowy';

export interface MLProbabilities {
  Sunny: number;
  Cloudy: number;
  Rainy: number;
  Snowy: number;
}

export interface MLPredictionSuccess {
  label: MLLabel;
  class_id: number;
  confidence: number;
  probabilities: MLProbabilities;
  fallback?: false;
  error?: undefined;
}

export interface MLPredictionFallback {
  label: null;
  class_id: null;
  confidence: 0;
  probabilities: MLProbabilities;
  fallback: true;
  error: string;
}

export type MLPrediction = MLPredictionSuccess | MLPredictionFallback;

export const isMLSuccess = (p: MLPrediction): p is MLPredictionSuccess =>
  !p.fallback && p.label !== null;
