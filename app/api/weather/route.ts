import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // Get query params from frontend request
    const { searchParams } = new URL(
      req.url,
      `http://${req.headers.get("host")}`
    );

    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");
    const date_of_trip = searchParams.get("date_of_trip");

    // Optional thresholds
    const hot = searchParams.get("hot");
    const cold = searchParams.get("cold");
    const windy = searchParams.get("windy");
    const rain = searchParams.get("rain");

    if (!lat || !lon || !date_of_trip) {
      return NextResponse.json(
        { error: "Missing required query params: lat, lon, date_of_trip" },
        { status: 400 }
      );
    }

    // Build query string for Flask API
    const flaskParams = new URLSearchParams({
      lat,
      lon,
      date_of_trip,
    });

    if (hot) flaskParams.append("hot", hot);
    if (cold) flaskParams.append("cold", cold);
    if (windy) flaskParams.append("windy", windy);
    if (rain) flaskParams.append("rain", rain);

    // Call Flask API
    const response = await fetch(
      `http://127.0.0.1:5000/weather_risk?${flaskParams.toString()}`
    );

    if (!response.ok) {
      const text = await response.text();
      return NextResponse.json({ error: text }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
