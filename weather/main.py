from flask import Flask, request, jsonify
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta
import requests
import io
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# ---------------------------
# Helper Functions
# ---------------------------
def fetch_weather_data(date_of_trip, location, parameters, data_format="CSV"):
    latitude, longitude = location
    dt = datetime.strptime(date_of_trip, "%Y%m%d")

    start_date = (dt - relativedelta(years=30)).strftime("%Y%m%d")
    end_date = datetime.today().strftime("%Y%m%d")

    url = (
        f"https://power.larc.nasa.gov/api/temporal/daily/point?"
        f"parameters={','.join(parameters)}&community=SB&longitude={longitude}"
        f"&latitude={latitude}&start={start_date}&end={end_date}&format={data_format}"
    )

    response = requests.get(url)
    if response.status_code != 200:
        raise Exception("Failed to fetch data from NASA POWER API")

    raw_data = response.text.split("-END HEADER-")[1]
    df = pd.read_csv(io.StringIO(raw_data.strip()))
    df.replace(-999, pd.NA, inplace=True)
    df.dropna(subset=["T2M_MAX", "T2M_MIN", "WS2M", "PRECTOTCORR"], inplace=True)
    df = df[["YEAR", "MO", "DY", "T2M", "T2M_MIN", "T2M_MAX", "WS2M", "RH2M", "PRECTOTCORR"]]
    df = df.rename(columns={"MO": "MONTH", "DY": "DAY"})
    df["DATE"] = pd.to_datetime(df[["YEAR", "MONTH", "DAY"]])
    df["DOY"] = df["DATE"].dt.day_of_year

    return df, dt

def extract_event_window(data, event_date):
    frames = []
    date_subset = data[(data["MONTH"] == event_date.month) & (data["DAY"] == event_date.day)]

    for date in date_subset["DATE"]:
        w_open = date - timedelta(days=7)
        w_close = date + timedelta(days=7)
        window = data[(data["DATE"] > w_open) & (data["DATE"] < w_close)]
        if not window.empty:
            frames.append(window)

    recent_window = data[data["DATE"] > (event_date - timedelta(days=7))]
    if not recent_window.empty:
        frames.append(recent_window)

    return pd.concat(frames, ignore_index=True)

def calculate_risks(data, event_data, thresholds=None):
    # Default thresholds
    default_thresholds = {"hot": 35, "cold": 0, "windy": 20, "rain": 10}
    thresholds = thresholds or default_thresholds

    # Percentiles for relative risks
    very_hot_pct = np.percentile(data["T2M_MAX"], 90)
    very_cold_pct = np.percentile(data["T2M_MIN"], 10)
    very_windy_pct = np.percentile(data["WS2M"], 90)
    very_wet_pct = np.percentile(data["PRECTOTCORR"], 90)

    probabilities = {
        "very_hot": (event_data["T2M_MAX"] > thresholds["hot"]).mean() * 100,
        "very_cold": (event_data["T2M_MIN"] < thresholds["cold"]).mean() * 100,
        "very_windy": (event_data["WS2M"] > thresholds["windy"]).mean() * 100,
        "very_wet": (event_data["PRECTOTCORR"] > thresholds["rain"]).mean() * 100,
        "hotter_than_usual": (event_data["T2M_MAX"] > very_hot_pct).mean() * 100,
        "colder_than_usual": (event_data["T2M_MIN"] < very_cold_pct).mean() * 100,
        "windier_than_usual": (event_data["WS2M"] > very_windy_pct).mean() * 100,
        "wetter_than_usual": (event_data["PRECTOTCORR"] > very_wet_pct).mean() * 100
    }
    return probabilities

def risk_level(prob):
    if prob == 0:
        return "No Risk"
    elif prob <= 20:
        return "Low Risk"
    elif prob <= 40:
        return "Medium Risk"
    elif prob <= 60:
        return "High Risk"
    else:
        return "Very High Risk"

# ---------------------------
# API Endpoint
# ---------------------------
@app.route("/weather_risk", methods=["GET"])
def weather_risk():
    date_of_trip = request.args.get("date_of_trip")
    lat = request.args.get("lat", type=float)
    lon = request.args.get("lon", type=float)

    if not date_of_trip or lat is None or lon is None:
        return jsonify({"error": "Missing parameters. Use ?date_of_trip=YYYYMMDD&lat=xx&lon=yy"}), 400

    # Optional personalized thresholds from user
    user_hot = request.args.get("hot", type=float)
    user_cold = request.args.get("cold", type=float)
    user_windy = request.args.get("windy", type=float)
    user_rain = request.args.get("rain", type=float)

    thresholds = {
        "hot": user_hot if user_hot is not None else 35,
        "cold": user_cold if user_cold is not None else 0,
        "windy": user_windy if user_windy is not None else 20,
        "rain": user_rain if user_rain is not None else 10
    }

    PARAMETERS = ["T2M", "T2M_MAX", "T2M_MIN", "WS2M", "PRECTOT", "RH2M"]

    try:
        data, event_dt = fetch_weather_data(date_of_trip, [lat, lon], PARAMETERS)
        event_data = extract_event_window(data, event_dt)
        probabilities = calculate_risks(data, event_data, thresholds)

        avg_temp = round(event_data["T2M"].tail(10).mean(), 2)
        avg_wind = round(event_data["WS2M"].tail(10).mean(), 2)
        avg_rain = round(event_data["PRECTOTCORR"].tail(10).mean(), 2)

        response = {
            "location": {"latitude": lat, "longitude": lon},
            "date_of_trip": date_of_trip,
            "average_conditions": {
                "temperature_C": avg_temp,
                "wind_speed_kmh": avg_wind,
                "rainfall_mm": avg_rain
            },
            "extreme_weather_risks": {
                key: {"probability_percent": round(prob,2), "risk_level": risk_level(prob)}
                for key, prob in probabilities.items() if key in ["very_hot","very_cold","very_windy","very_wet"]
            },
            "relative_weather_risks": {
                key: {"probability_percent": round(prob,2), "risk_level": risk_level(prob)}
                for key, prob in probabilities.items() if key in ["hotter_than_usual","colder_than_usual","windier_than_usual","wetter_than_usual"]
            }
        }
        return jsonify(response), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ---------------------------
# MAIN
# ---------------------------
if __name__ == "__main__":
    app.run(debug=True, port=5000)
