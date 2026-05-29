import { z } from "zod";

export const ReceiptSchema = z.object({
  restaurant: z.string().min(1),
  items: z
    .array(
      z.object({
        name: z.string().min(1),
        quantity: z.number().positive(),
        unitPrice: z.number().nonnegative(),
        emoji: z.string().nullable(),
      })
    )
    .min(1),
  subtotal: z.number().nonnegative(),
  tax: z.number().nonnegative(),
  total: z.number().nonnegative(),
});

export type ReceiptParsed = z.infer<typeof ReceiptSchema>;
