import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, business, industry, pain_point, revenue, timeline } = body;

    const prompt = "You are a sales closer for Thrive Automation Agency. Write 3 sentences max. Client: " + name + " at " + business + " (" + industry + "). Pain points: " + pain_point + ". Revenue: " + revenue + ". Timeline: " + timeline + ". Sentence 1: Identify their exact pain and quantify what it is costing them in time or money. Sentence 2: Tell them that fixing this is exactly what Thrive was built for and that the solution is simpler than they think. Sentence 3: Create urgency to book a free 20-minute strategy call to get their custom plan. Never claim past results or clients. Be confident and conversational. No bullet points. No markdown. Plain sentences only.";

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 200,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();
    const recommendation = data.content?.[0]?.text || "Unable to generate recommendation.";
    return NextResponse.json({ recommendation });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ recommendation: "Based on what you shared, there are clear gaps we can close fast. Lets map it out on a quick call." });
  }
}
