import { NextResponse } from "next/server";
import OpenAI from "openai";

import { findAgent } from "@/lib/agents";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const DEFAULT_MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "Missing OPENAI_API_KEY. Please configure the environment variable." },
      { status: 500 },
    );
  }

  let payload: { agentId?: string; input?: string } = {};

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload." },
      { status: 400 },
    );
  }

  const agentId = payload.agentId?.trim();
  const userInput = payload.input?.trim();

  if (!agentId || !userInput) {
    return NextResponse.json(
      { error: "Both agentId and input are required." },
      { status: 400 },
    );
  }

  const agent = findAgent(agentId);

  if (!agent) {
    return NextResponse.json({ error: "Unknown agent." }, { status: 404 });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      temperature: 0.3,
      messages: [
        { role: "system", content: agent.prompt },
        { role: "user", content: userInput },
      ],
    });

    const result =
      completion.choices[0]?.message?.content?.trim() ??
      "The model did not return any content.";

    return NextResponse.json({ result });
  } catch (error) {
    console.error("OpenAI error", error);
    return NextResponse.json(
      { error: "Unable to reach OpenAI. Please try again later." },
      { status: 500 },
    );
  }
}
