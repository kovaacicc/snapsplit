"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import type { ParsedReceipt, Person } from "@/lib/types";
import { money } from "@/lib/format";
import { expandUnits, groupUnits, round2, type SplitUnit } from "@/lib/split";

const AVATARS = ["😎", "🦊", "🐼", "🦄", "🐙", "🐯", "🦋", "🐸", "🦉", "🐳"];

export default function SplitScreen({
  receipt,
  people,
  onRestart,
}: {
  receipt: ParsedReceipt;
  people: Person[];
  onRestart: () => void;
}) {
  const [units, setUnits] = useState<SplitUnit[]>(() => expandUnits(receipt));
  const [restaurant, setRestaurant] = useState(receipt.restaurant);
  const [tax, setTax] = useState(receipt.tax);
  // unitId -> personId. Absent = unassigned.
  const [assign, setAssign] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<string | null>(null);

  const subtotal = useMemo(
    () => round2(units.reduce((s, u) => s + u.unitPrice, 0)),
    [units]
  );
  const total = round2(subtotal + tax);

  const unitsByPerson = (pid: string) => units.filter((u) => assign[u.id] === pid);
  const unassignedUnits = units.filter((u) => !assign[u.id]);
  const groups = groupUnits(unassignedUnits);
  const unassignedTotal = round2(unassignedUnits.reduce((s, u) => s + u.unitPrice, 0));

  const personTotals = (pid: string) => {
    const sub = round2(unitsByPerson(pid).reduce((s, u) => s + u.unitPrice, 0));
    const t = subtotal > 0 ? round2(tax * (sub / subtotal)) : 0;
    return { sub, tax: t, total: round2(sub + t) };
  };

  const selectedUnit = units.find((u) => u.id === selected) ?? null;

  const tapUnit = (u: SplitUnit) => {
    if (assign[u.id]) {
      // assigned chip -> send back to the pool
      setAssign((a) => {
        const next = { ...a };
        delete next[u.id];
        return next;
      });
      setSelected(null);
    } else {
      setSelected((s) => (s === u.id ? null : u.id));
    }
  };

  const tapPerson = (pid: string) => {
    if (!selected) return;
    setAssign((a) => ({ ...a, [selected]: pid }));
    setSelected(null);
  };

  const editGroup = (groupId: string, patch: Partial<Pick<SplitUnit, "name" | "unitPrice">>) =>
    setUnits((us) => us.map((u) => (u.groupId === groupId ? { ...u, ...patch } : u)));

  const assignedCount = units.length - unassignedUnits.length;

  return (
    <LayoutGroup>
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <div className="glass mb-3 rounded-3xl p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-indigo-500">
                Receipt
              </p>
              <InlineText
                value={restaurant}
                onChange={setRestaurant}
                className="text-[22px] font-extrabold leading-tight text-slate-900"
              />
            </div>
            <div className="shrink-0 text-right">
              <p className="text-[11px] font-medium text-slate-400">Total</p>
              <p className="text-[22px] font-extrabold text-slate-900">{money(total)}</p>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-4 text-[13px] text-slate-500">
            <span>Subtotal {money(subtotal)}</span>
            <span className="flex items-center gap-1">
              Tax{" "}
              <InlineNumber
                value={tax}
                onChange={setTax}
                className="font-semibold text-slate-700"
              />
            </span>
            <span className="ml-auto font-medium text-slate-400">
              {assignedCount}/{units.length} assigned
            </span>
          </div>
        </div>

        {/* Selection hint */}
        <div className="mb-3 h-8">
          <AnimatePresence>
            {selectedUnit && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="flex h-8 items-center justify-center rounded-full bg-indigo-600 text-[13px] font-semibold text-white shadow-md shadow-indigo-500/30"
              >
                Tap a person to assign {selectedUnit.emoji ?? "•"} {selectedUnit.name}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto no-scrollbar pb-4 md:flex md:space-x-4 md:space-y-0">
          {/* LEFT: items / unassigned */}
          <section className="md:flex-1">
            <SectionLabel>
              Items {unassignedUnits.length > 0 && <Pill>{money(unassignedTotal)} left</Pill>}
            </SectionLabel>
            <div className="space-y-2.5">
              {groups.map((g) => (
                <div key={g.groupId} className="glass rounded-2xl p-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{g.emoji ?? "🍽️"}</span>
                    <InlineText
                      value={g.name}
                      onChange={(v) => editGroup(g.groupId, { name: v })}
                      className="flex-1 text-[15px] font-semibold text-slate-800"
                    />
                    <span className="text-[13px] text-slate-400">@</span>
                    <InlineNumber
                      value={g.unitPrice}
                      onChange={(v) => editGroup(g.groupId, { unitPrice: v })}
                      className="text-[14px] font-semibold text-slate-700"
                    />
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {g.units.map((u) => (
                      <Chip
                        key={u.id}
                        unit={u}
                        selected={selected === u.id}
                        onTap={() => tapUnit(u)}
                      />
                    ))}
                  </div>
                </div>
              ))}
              {groups.length === 0 && (
                <div className="rounded-2xl border-2 border-dashed border-emerald-200 bg-emerald-50/50 py-6 text-center text-[14px] font-semibold text-emerald-600">
                  🎉 Everything assigned!
                </div>
              )}
            </div>
          </section>

          {/* RIGHT: people */}
          <section className="md:flex-1">
            <SectionLabel>People</SectionLabel>
            <div className="space-y-2.5">
              {people.map((p, i) => {
                const mine = unitsByPerson(p.id);
                const tt = personTotals(p.id);
                const armed = !!selected;
                return (
                  <motion.div
                    layout
                    key={p.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => tapPerson(p.id)}
                    whileTap={armed ? { scale: 0.98 } : undefined}
                    className={`glass block w-full cursor-pointer rounded-2xl p-3 text-left transition ${
                      armed ? "ring-2 ring-indigo-400 ring-offset-2 ring-offset-transparent" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-100 to-fuchsia-100 text-lg">
                        {AVATARS[i % AVATARS.length]}
                      </div>
                      <span className="flex-1 truncate text-[15px] font-bold text-slate-800">
                        {p.name || `Person ${i + 1}`}
                      </span>
                      <span className="text-[16px] font-extrabold text-indigo-600">
                        {money(tt.total)}
                      </span>
                    </div>

                    <div className="mt-2 flex min-h-[28px] flex-wrap gap-1.5">
                      <AnimatePresence mode="popLayout">
                        {mine.map((u) => (
                          <Chip key={u.id} unit={u} selected={false} onTap={() => tapUnit(u)} />
                        ))}
                      </AnimatePresence>
                      {mine.length === 0 && (
                        <span className="text-[12px] italic text-slate-400">
                          {armed ? "Tap to drop item here" : "No items yet"}
                        </span>
                      )}
                    </div>

                    {mine.length > 0 && (
                      <div className="mt-2 flex gap-3 border-t border-slate-200/70 pt-2 text-[12px] text-slate-500">
                        <span>Sub {money(tt.sub)}</span>
                        <span>Tax {money(tt.tax)}</span>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </section>
        </div>

        <button
          onClick={onRestart}
          className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/60 py-3 text-[14px] font-semibold text-slate-500 transition hover:bg-white active:scale-[0.99]"
        >
          Start over
        </button>
      </div>
    </LayoutGroup>
  );
}

function Chip({
  unit,
  selected,
  onTap,
}: {
  unit: SplitUnit;
  selected: boolean;
  onTap: () => void;
}) {
  return (
    <motion.button
      layoutId={unit.id}
      layout
      onClick={(e) => {
        e.stopPropagation();
        onTap();
      }}
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.6 }}
      transition={{ type: "spring", stiffness: 600, damping: 38 }}
      className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-semibold shadow-sm transition ${
        selected
          ? "bg-indigo-600 text-white ring-2 ring-indigo-300"
          : "bg-white text-slate-700"
      }`}
    >
      <span>{unit.emoji ?? "•"}</span>
      <span>{money(unit.unitPrice)}</span>
    </motion.button>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2 flex items-center gap-2 px-1 text-[12px] font-bold uppercase tracking-wider text-slate-400">
      {children}
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
      {children}
    </span>
  );
}

// Tap-to-edit text (name / restaurant)
function InlineText({
  value,
  onChange,
  className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  const [editing, setEditing] = useState(false);
  if (editing) {
    return (
      <input
        autoFocus
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => setEditing(false)}
        onKeyDown={(e) => e.key === "Enter" && setEditing(false)}
        onClick={(e) => e.stopPropagation()}
        className={`w-full rounded-md bg-indigo-50 px-1 outline-none ring-1 ring-indigo-300 ${className}`}
      />
    );
  }
  return (
    <span
      onClick={(e) => {
        e.stopPropagation();
        setEditing(true);
      }}
      className={`cursor-text truncate rounded-md px-1 transition hover:bg-indigo-50 ${className}`}
    >
      {value}
    </span>
  );
}

// Tap-to-edit money value
function InlineNumber({
  value,
  onChange,
  className = "",
}: {
  value: number;
  onChange: (v: number) => void;
  className?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  if (editing) {
    return (
      <input
        autoFocus
        inputMode="decimal"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => {
          const n = parseFloat(draft);
          onChange(isNaN(n) ? 0 : n);
          setEditing(false);
        }}
        onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
        onClick={(e) => e.stopPropagation()}
        className={`w-14 rounded-md bg-indigo-50 px-1 text-right outline-none ring-1 ring-indigo-300 ${className}`}
      />
    );
  }
  return (
    <span
      onClick={(e) => {
        e.stopPropagation();
        setDraft(String(value));
        setEditing(true);
      }}
      className={`cursor-text rounded-md px-1 transition hover:bg-indigo-50 ${className}`}
    >
      {money(value)}
    </span>
  );
}
