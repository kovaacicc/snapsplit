import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

// Forwards the (already client-compressed) image to OCR.space and returns text.
export async function POST(req: NextRequest) {
  const apiKey = process.env.ocrspace;
  if (!apiKey) {
    return NextResponse.json({ error: "missing_key" }, { status: 500 });
  }

  try {
    const inForm = await req.formData();
    const file = inForm.get("image");
    if (!(file instanceof Blob)) {
      return NextResponse.json({ error: "no_image" }, { status: 400 });
    }

    const buf = Buffer.from(await file.arrayBuffer());
    const base64 = `data:image/jpeg;base64,${buf.toString("base64")}`;

    const form = new FormData();
    form.append("base64Image", base64);
    form.append("language", "eng");
    form.append("isTable", "true");
    form.append("OCREngine", "2");
    form.append("scale", "true");

    const res = await fetch("https://api.ocr.space/parse/image", {
      method: "POST",
      headers: { apikey: apiKey },
      body: form,
    });

    const data = await res.json();
    if (data.IsErroredOnProcessing) {
      const msg = Array.isArray(data.ErrorMessage)
        ? data.ErrorMessage.join("; ")
        : data.ErrorMessage || "ocr_error";
      return NextResponse.json({ error: msg }, { status: 502 });
    }

    const text: string = (data.ParsedResults ?? [])
      .map((r: { ParsedText?: string }) => r.ParsedText ?? "")
      .join("\n")
      .trim();

    if (!text) {
      return NextResponse.json({ error: "empty_text" }, { status: 502 });
    }

    return NextResponse.json({ text });
  } catch {
    return NextResponse.json({ error: "ocr_failed" }, { status: 500 });
  }
}
