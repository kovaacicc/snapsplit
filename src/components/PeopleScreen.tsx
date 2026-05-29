"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { Person } from "@/lib/types";
import { uid } from "@/lib/format";

const AVATARS = ["😎", "🦊", "🐼", "🦄", "🐙", "🐯", "🦋", "🐸", "🦉", "🐳"];

export default function PeopleScreen({
  people,
  setPeople,
  onContinue,
}: {
  people: Person[];
  setPeople: React.Dispatch<React.SetStateAction<Person[]>>;
  onContinue: () => void;
}) {
  const add = () => setPeople((p) => [...p, { id: uid("p"), name: "" }]);
  const remove = (id: string) =>
    setPeople((p) => p.filter((x) => x.id !== id));
  const rename = (id: string, name: string) =>
    setPeople((p) => p.map((x) => (x.id === id ? { ...x, name } : x)));

  const named = people.filter((p) => p.name.trim().length > 0);
  const canContinue = named.length >= 1;

  return (
    <div className="flex flex-1 flex-col">
      <div className="mb-5">
        <h1 className="text-[28px] font-extrabold leading-tight tracking-tight text-slate-900">
          Who&apos;s paying?
        </h1>
        <p className="mt-1 text-[15px] text-slate-500">
          Add everyone splitting the bill.
        </p>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto no-scrollbar pb-2">
        <AnimatePresence initial={false}>
          {people.map((person, i) => (
            <motion.div
              key={person.id}
              layout
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
              transition={{ type: "spring", stiffness: 500, damping: 34 }}
              className="glass flex items-center gap-3 rounded-2xl p-2.5 pr-3"
            >
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-indigo-100 to-fuchsia-100 text-xl">
                {AVATARS[i % AVATARS.length]}
              </div>
              <input
                autoFocus={person.name === "" && i === people.length - 1}
                value={person.name}
                onChange={(e) => rename(person.id, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && person.name.trim()) add();
                }}
                placeholder={`Person ${i + 1}`}
                className="min-w-0 flex-1 bg-transparent text-[17px] font-medium text-slate-900 outline-none placeholder:text-slate-400"
              />
              {people.length > 1 && (
                <button
                  onClick={() => remove(person.id)}
                  aria-label="Remove"
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-slate-400 transition hover:bg-rose-50 hover:text-rose-500 active:scale-90"
                >
                  ✕
                </button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        <button
          onClick={add}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-indigo-200 bg-white/40 py-3.5 text-[15px] font-semibold text-indigo-600 transition hover:border-indigo-300 hover:bg-white/70 active:scale-[0.99]"
        >
          <span className="text-lg leading-none">+</span> Add person
        </button>
      </div>

      <div className="pt-4">
        <motion.button
          whileTap={canContinue ? { scale: 0.97 } : undefined}
          disabled={!canContinue}
          onClick={onContinue}
          className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 py-4 text-[16px] font-bold text-white shadow-lg shadow-indigo-500/30 transition disabled:cursor-not-allowed disabled:opacity-40"
        >
          {canContinue
            ? `Continue with ${named.length} ${named.length === 1 ? "person" : "people"}`
            : "Add at least one person"}
        </motion.button>
      </div>
    </div>
  );
}
