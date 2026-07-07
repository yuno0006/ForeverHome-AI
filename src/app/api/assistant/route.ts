import { NextRequest, NextResponse } from "next/server";
import {
  generateGeneralAssistantResponse,
  fallbackGeneralAssistantResponse,
  ImageInput,
} from "@/lib/gemini";
import { logAIInteractionAsync } from "@/lib/aiLoggingService";

export const maxDuration = 60;

/**
 * POST /api/assistant
 *
 * General site assistant — NOT tied to any specific cat or adoption.
 * Available to guests and logged-in users alike. Answers questions about
 * how the site works, cat adoption in general, and can look at an uploaded
 * cat photo. For post-adoption, cat-specific day-to-day support, users are
 * directed to their dedicated per-cat Coach (see /api/coach).
 */

interface AssistantRequestBody {
  message: string;
  history?: { role: "user" | "assistant"; content: string }[];
  image?: ImageInput;
  uid?: string | null;
}

export async function POST(req: NextRequest) {
  try {
    const body: AssistantRequestBody = await req.json();
    const { message, history, image, uid } = body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json({ error: "message is required" }, { status: 400 });
    }

    const conversationContext = (history || [])
      .slice(-6)
      .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
      .join("\n");

    const aiResponse = await generateGeneralAssistantResponse(message, conversationContext, image);
    const source = aiResponse ? "gemini" : "fallback";
    const finalResponse = aiResponse || fallbackGeneralAssistantResponse(message);

    logAIInteractionAsync({
      uid: uid || "guest",
      catId: "general-assistant",
      question: message,
      response: finalResponse,
      source,
    });

    return NextResponse.json({
      response: finalResponse,
      source,
      disclaimer:
        source === "fallback"
          ? "This response was generated without AI. Connect a Gemini API key for personalized answers."
          : undefined,
    });
  } catch (error) {
    console.error("Assistant API error:", error);
    return NextResponse.json(
      { error: "Failed to generate assistant response" },
      { status: 500 }
    );
  }
}
