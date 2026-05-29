import { NextRequest, NextResponse } from "next/server";
import { ReceiptSchema } from "@/lib/schema";
import { SAMPLE_RECEIPT } from "@/lib/sample";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `You extract structured data from a restaurant receipt's OCR text.
Return ONLY a JSON object with this exact shape:
{
  "restaurant": string,
  "items": [{ "name": string, "quantity": number, "unitPrice": number, "emoji": string|null }],
  "subtotal": number, "tax": number, "total": number
}
Rules:
- ONLY group identical item names AND only when quantity > 1. NEVER merge different item types (e.g. California Roll != Salmon Nigiri).
- unitPrice is the price for ONE unit (not the line total).
- Suggest a single food emoji per item (e.g. 🍟🍕🍔🍣🥤). Use null if none fits.
- All money values are plain numbers (no currency symbols).
- If a field is missing from the text, infer a sensible value (subtotal/total can be summed/estimated).`;

async function callDeepSeek(text: string): Promise<unknown> {
  const res = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.deepseekapi}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      response_format: { type: "json_object" },
      temperature: 0,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Receipt OCR text:\n\n${text}` },
      ],
    }),
  });
  if (!res.ok) throw new Error(`deepseek_${res.status}`);
  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  return JSON.parse(content);
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.deepseekapi;
  let text = "";
  try {
    ({ text } = await req.json());
  } catch {
    /* ignore */
  }

  // No key or no text → sample fallback so the demo always proceeds.
  if (!apiKey || !text) {
    return NextResponse.json({ receipt: SAMPLE_RECEIPT, fallback: true });
  }

  // Try twice, then fall back to the sample.
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const raw = await callDeepSeek(text);
      const parsed = ReceiptSchema.safeParse(raw);
      if (parsed.success) {
        return NextResponse.json({ receipt: parsed.data, fallback: false });
      }
    } catch {
      /* retry */
    }
  }

  return NextResponse.json({ receipt: SAMPLE_RECEIPT, fallback: true });
}
