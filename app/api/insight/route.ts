import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(req: Request) {
  try {
    const { weatherData } = await req.json();

    if (!weatherData) {
      return NextResponse.json(
        { error: "weatherData is required" },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const prompt = `
You are a weather assistant. Based on the following weather data, provide only **key insights and actionable suggestions
for planning an outdoor event. 
Limit to 5 concise bullet points max.
Do not include greetings, explanations, 
or any chit-chat—only important insights and suggestions.
Respond only in plain bullet points no astrisks at the start of each line.
Do not use numbering, emojis, or extra symbols. 


Weather data:
${JSON.stringify(weatherData)}
`;

    // Generate content
    const result = await model.generateContent(prompt);

    // Access the candidates array and extract the text from each candidate
    const response = await result.response;
    const summary = response.text();
    return NextResponse.json({ summary });
  } catch (err: any) {
    console.error("❌ Insights API Error:", err.message || err);
    return NextResponse.json(
      { error: "Failed to generate insights" },
      { status: 500 }
    );
  }
}
