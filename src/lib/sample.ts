import type { ParsedReceipt } from "./types";

// Hardcoded sample receipt — used as the mock/fallback so the flow ALWAYS
// reaches the split screen even when keys are missing or the AI/OCR errors.
export const SAMPLE_RECEIPT: ParsedReceipt = {
  restaurant: "Burger House",
  items: [
    { name: "Fries", quantity: 4, unitPrice: 3, emoji: "🍟" },
    { name: "Margherita Pizza", quantity: 1, unitPrice: 12, emoji: "🍕" },
    { name: "Coke", quantity: 2, unitPrice: 2.5, emoji: "🥤" },
  ],
  subtotal: 24,
  tax: 2,
  total: 26,
};
