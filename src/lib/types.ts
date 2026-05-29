// Raw shape returned by /api/parse (and the mock fallback)
export type ParsedItem = {
  name: string;
  quantity: number;
  unitPrice: number;
  emoji: string | null;
};

export type ParsedReceipt = {
  restaurant: string;
  items: ParsedItem[];
  subtotal: number;
  tax: number;
  total: number;
};

// A single assignable unit (grouped quantities are expanded into these)
export type Unit = {
  id: string;
  name: string;
  emoji: string | null;
  unitPrice: number;
};

export type Person = {
  id: string;
  name: string;
};

export type Step = "people" | "upload" | "processing" | "split";
