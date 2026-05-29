import type { ParsedReceipt } from "./types";
import { SAMPLE_RECEIPT } from "./sample";

// Orchestrates compress->OCR->parse. ALWAYS resolves to a receipt:
// any failure (or no image = sample mode) falls back to the sample receipt.
export async function runReceiptPipeline(
  blob: Blob | null
): Promise<{ receipt: ParsedReceipt; fallback: boolean }> {
  try {
    let text = "";
    if (blob) {
      const form = new FormData();
      form.append("image", blob, "receipt.jpg");
      const ocrRes = await fetch("/api/ocr", { method: "POST", body: form });
      if (ocrRes.ok) {
        const ocr = await ocrRes.json();
        text = ocr.text ?? "";
      }
    }

    const res = await fetch("/api/parse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    const data = await res.json();
    if (data?.receipt) return { receipt: data.receipt, fallback: !!data.fallback };
  } catch {
    /* fall through */
  }
  return { receipt: SAMPLE_RECEIPT, fallback: true };
}
