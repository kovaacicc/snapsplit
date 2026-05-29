"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const MESSAGES = [
  "Scanning the receipt…",
  "Reading the items…",
  "Adding up the prices…",
  "Almost there…",
];

export default function ProcessingScreen({ preview }: { preview: string | null }) {
  const [msg, setMsg] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setMsg((m) => Math.min(m + 1, MESSAGES.length - 1)),
      900
    );
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-7">
      {/* Receipt with scan-line sweep */}
      <div className="relative aspect-[3/4] w-56 overflow-hidden rounded-3xl shadow-2xl shadow-indigo-500/20">
        {preview ? (
          <img src={preview} alt="" className="h-full w-full object-cover" />
        ) : (
          <FauxReceipt />
        )}

        {/* dark vignette for contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/5" />

        {/* the scan line */}
        <motion.div
          initial={{ top: "-12%" }}
          animate={{ top: "112%" }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute left-0 right-0 h-16 -translate-y-1/2"
          style={{
            background:
              "linear-gradient(to bottom, rgba(99,102,241,0) 0%, rgba(99,102,241,0.35) 45%, rgba(168,85,247,0.6) 50%, rgba(99,102,241,0.35) 55%, rgba(99,102,241,0) 100%)",
          }}
        >
          <div className="absolute left-0 right-0 top-1/2 h-[2px] -translate-y-1/2 bg-gradient-to-r from-transparent via-fuchsia-400 to-transparent shadow-[0_0_12px_2px_rgba(217,70,239,0.7)]" />
        </motion.div>

        {/* scanning grid shimmer */}
        <motion.div
          animate={{ opacity: [0.15, 0.35, 0.15] }}
          transition={{ duration: 1.6, repeat: Infinity }}
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, rgba(99,102,241,0.06) 0px, rgba(99,102,241,0.06) 1px, transparent 1px, transparent 14px)",
          }}
        />
      </div>

      {/* Spinner + animated message */}
      <div className="flex flex-col items-center gap-3">
        <div className="relative h-9 w-9">
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border-[3px] border-indigo-200 border-t-indigo-600"
          />
        </div>
        <div className="h-6 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.p
              key={msg}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="text-[16px] font-semibold text-slate-700"
            >
              {MESSAGES[msg]}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// Stylized placeholder receipt for sample mode (no photo).
function FauxReceipt() {
  return (
    <div className="flex h-full w-full flex-col gap-2.5 bg-white p-5">
      <div className="mx-auto mb-2 h-3 w-2/3 rounded bg-slate-300" />
      <div className="mx-auto h-2 w-1/2 rounded bg-slate-200" />
      <div className="my-3 border-t border-dashed border-slate-200" />
      {[80, 65, 72, 58, 70, 50].map((w, i) => (
        <div key={i} className="flex items-center justify-between gap-2">
          <div className="h-2.5 rounded bg-slate-200" style={{ width: `${w}%` }} />
          <div className="h-2.5 w-8 rounded bg-slate-200" />
        </div>
      ))}
      <div className="my-2 border-t border-dashed border-slate-200" />
      <div className="flex items-center justify-between">
        <div className="h-3 w-14 rounded bg-slate-300" />
        <div className="h-3 w-10 rounded bg-slate-300" />
      </div>
    </div>
  );
}
