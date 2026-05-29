# SnapSplit — Build Progress

Mobile-first receipt-splitting web app. 1-hour hackathon build.

## Stack
Next.js (App Router) + TS, Tailwind, Framer Motion, Zod. Deploy: Vercel.

## Key facts / deviations
- **AI = DeepSeek, not OpenAI.** OpenAI-compatible API. Base URL `https://api.deepseek.com`, model `deepseek-chat`, JSON mode supported.
- Env vars (already in `.env`, non-standard names — keep as-is):
  - `ocrspace` = OCR.space API key
  - `deepseekapi` = DeepSeek API key
- Single page, step state machine: `people | upload | processing | split`. All state in memory.
- Two server routes: `/api/ocr` (→ OCR.space), `/api/parse` (→ DeepSeek, Zod-validated).
- Client-side image compression before OCR (max ~1000px, JPEG ~0.7).
- MOCK FALLBACK always reaches split screen. Sample: Burger House — Fries x4 @3 🍟, Margherita Pizza x1 @12 🍕, Coke x2 @2.5 🥤, subtotal 24, tax 2, total 26.

## Build steps
- [x] 1. Scaffold + step machine + Screen 1 (people) — DONE, verified in Playwright
      Files: src/components/SnapSplit.tsx (shell+step machine), src/components/PeopleScreen.tsx,
      src/lib/{types,sample,format}.ts. Dev: `npm run dev`. AnimatePresence mode="wait" between steps.
- [x] 2. Screen 2 upload + preview + client compression — DONE, verified.
      Files: src/components/UploadScreen.tsx, src/lib/compress.ts (canvas resize maxEdge 1000, jpeg 0.7).
      SnapSplit holds preview(dataUrl)+imageBlob. Continue/UseSample → setStep("processing").
      imageBlob currently unused (consumed in step 4 API wiring).
- [x] 3. Screen 4 split on mock — DONE, verified end-to-end in browser.
      Files: src/components/SplitScreen.tsx, src/lib/split.ts (expandUnits/groupUnits/round2).
      Tap unit chip → highlights → tap person card → assigns (Framer layoutId animation).
      Tap an assigned chip → returns to pool. Inline edit: restaurant, item name, item price, tax.
      DECISION: subtotal/total DERIVED from sum of units (sample's 24 != items 29), tax editable.
      personTax = tax*(personSub/subtotal). Person card is motion.div (not button) to avoid nested-button.
      TEMP: upload Continue/UseSample both load SAMPLE_RECEIPT → split (processing/OCR wired in steps 4-5).
- [x] 4. Wire /api/ocr + /api/parse + Zod + fallback — DONE, verified e2e with a generated receipt.
      Files: src/app/api/ocr/route.ts (OCR.space, base64Image, engine2), src/app/api/parse/route.ts
      (DeepSeek https://api.deepseek.com/chat/completions, deepseek-chat, json_object, temp 0, 2 attempts),
      src/lib/schema.ts (Zod ReceiptSchema), src/lib/pipeline.ts (client orchestrator, sample on any fail).
      SnapSplit.startProcessing(useSample) runs pipeline then → split. Confirmed fallback:false from DeepSeek.
- [x] 5. Screen 3 processing animations + polish — DONE, verified.
      File: src/components/ProcessingScreen.tsx — scan-line sweep over receipt preview (or FauxReceipt
      skeleton in sample mode), spinner, cycling status messages. startProcessing holds min 2400ms.
      Verified REAL e2e via browser file upload (/tmp/receipt3.jpg): compress→OCR→DeepSeek→split, real data.
      `npm run build` passes clean. package.json name -> snapsplit.
- [ ] 6. Deploy Vercel + phone camera test

## Totals logic
- expand grouped qty into individual units {id,name,emoji,unitPrice}
- personSubtotal = sum assigned unit prices
- personTax = tax * (personSubtotal / subtotal)
- personTotal = personSubtotal + personTax; 2 decimals
