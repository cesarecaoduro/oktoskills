import { generateText, gateway } from "ai";
import { NextResponse } from "next/server";
import type { LLMExecuteRequest } from "@/lib/flow/execution-types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LLMExecuteRequest;

    if (!body.modelId) {
      return NextResponse.json({ error: "modelId is required" }, { status: 400 });
    }
    if (!body.userPrompt) {
      return NextResponse.json({ error: "userPrompt is required" }, { status: 400 });
    }

    const result = await generateText({
      model: gateway(body.modelId),
      system: body.systemPrompt || undefined,
      prompt: body.userPrompt,
      temperature: body.temperature ?? 0.7,
      maxOutputTokens: body.maxTokens ?? 1024,
    });

    return NextResponse.json({
      text: result.text,
      usage: result.usage,
      finishReason: result.finishReason,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
