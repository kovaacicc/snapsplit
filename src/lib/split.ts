import type { ParsedReceipt, Unit } from "./types";
import { uid } from "./format";

// A unit carries a groupId so the UI can group identical-line units together
// and so inline edits apply to the whole group (not merge different items).
export type SplitUnit = Unit & { groupId: string };

export function expandUnits(receipt: ParsedReceipt): SplitUnit[] {
  const units: SplitUnit[] = [];
  receipt.items.forEach((item, gi) => {
    const groupId = `g${gi}`;
    const qty = Math.max(1, Math.round(item.quantity));
    for (let i = 0; i < qty; i++) {
      units.push({
        id: uid("u"),
        groupId,
        name: item.name,
        emoji: item.emoji,
        unitPrice: item.unitPrice,
      });
    }
  });
  return units;
}

export type Group = {
  groupId: string;
  name: string;
  emoji: string | null;
  unitPrice: number;
  units: SplitUnit[];
};

export function groupUnits(units: SplitUnit[]): Group[] {
  const order: string[] = [];
  const map = new Map<string, Group>();
  for (const u of units) {
    let g = map.get(u.groupId);
    if (!g) {
      g = { groupId: u.groupId, name: u.name, emoji: u.emoji, unitPrice: u.unitPrice, units: [] };
      map.set(u.groupId, g);
      order.push(u.groupId);
    }
    g.units.push(u);
  }
  return order.map((id) => map.get(id)!);
}

export const round2 = (n: number) => Math.round(n * 100) / 100;
