# 🧾 SnapSplit

Split restaurant receipts by photo. Snap → tap to assign → done.

Mobile-first web app: Next.js (App Router) + TypeScript, Tailwind CSS, Framer Motion.
Single page, step state machine (`people → upload → processing → split`) — all state in memory.

## How it works
1. **Who's paying?** — add the people splitting the bill.
2. **Snap the receipt** — phone camera (`capture="environment"`) or library; the image is
   compressed client-side (~1000px, JPEG 0.7) before upload.
3. **Processing** — animated scan-line over the receipt while it's read.
4. **Split** — tap an item unit, then tap a person to assign it. Inline-edit any name/price.
   Per-person subtotal, proportional tax, and total update live.

### Pipeline (keys stay server-side)
- `POST /api/ocr` → forwards the compressed image to **OCR.space**, returns extracted text.
- `POST /api/parse` → sends OCR text only to **DeepSeek** (`deepseek-chat`, JSON mode),
  validates with Zod (2 attempts), and falls back to a sample receipt on any failure.

If a key is missing or anything errors, the flow still reaches the split screen using a
hardcoded sample receipt. There's also a "Use sample receipt" button on the upload screen.

## Local dev
```bash
npm install
# create .env with your keys (see .env.example)
npm run dev
```

## Env vars
Set these (server-side only) — locally in `.env`, and on Vercel in
**Project → Settings → Environment Variables**:

| Name          | Value                          |
| ------------- | ------------------------------ |
| `ocrspace`    | OCR.space API key              |
| `deepseekapi` | DeepSeek API key               |

## Deploy (Vercel)
1. Push this repo to GitHub.
2. Import it at [vercel.com/new](https://vercel.com/new).
3. Add the two env vars above (all environments).
4. Deploy. HTTPS is automatic — required for the phone camera.
