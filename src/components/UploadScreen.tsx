"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function UploadScreen({
  preview,
  onPick,
  onContinue,
  onUseSample,
  onBack,
}: {
  preview: string | null;
  onPick: (file: File) => void;
  onContinue: () => void;
  onUseSample: () => void;
  onBack: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [picking, setPicking] = useState(false);

  return (
    <div className="flex flex-1 flex-col">
      <button
        onClick={onBack}
        className="mb-3 self-start text-sm font-semibold text-slate-500 transition hover:text-slate-800"
      >
        ← Back
      </button>

      <div className="mb-5">
        <h1 className="text-[28px] font-extrabold leading-tight tracking-tight text-slate-900">
          Snap the receipt
        </h1>
        <p className="mt-1 text-[15px] text-slate-500">
          Take a photo or pick one from your library.
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) {
            setPicking(true);
            onPick(f);
            setTimeout(() => setPicking(false), 400);
          }
          e.target.value = "";
        }}
      />

      {/* Capture / preview area */}
      <button
        onClick={() => inputRef.current?.click()}
        className="glass relative flex flex-1 items-center justify-center overflow-hidden rounded-3xl p-4 transition active:scale-[0.99]"
      >
        <AnimatePresence mode="wait">
          {preview ? (
            <motion.img
              key="preview"
              src={preview}
              alt="Receipt preview"
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-h-full max-w-full rounded-2xl object-contain shadow-lg"
            />
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3 text-center"
            >
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                className="grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-4xl shadow-xl shadow-indigo-500/30"
              >
                📸
              </motion.div>
              <div>
                <p className="text-[16px] font-semibold text-slate-800">
                  Tap to open camera
                </p>
                <p className="text-[13px] text-slate-400">JPG or PNG</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {preview && (
          <span className="absolute bottom-3 right-3 rounded-full bg-slate-900/70 px-3 py-1 text-xs font-medium text-white backdrop-blur">
            {picking ? "Optimizing…" : "Tap to retake"}
          </span>
        )}
      </button>

      {/* Actions */}
      <div className="space-y-2.5 pt-4">
        <motion.button
          whileTap={preview ? { scale: 0.97 } : undefined}
          disabled={!preview}
          onClick={onContinue}
          className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 py-4 text-[16px] font-bold text-white shadow-lg shadow-indigo-500/30 transition disabled:cursor-not-allowed disabled:opacity-40"
        >
          Continue
        </motion.button>
        <button
          onClick={onUseSample}
          className="w-full rounded-2xl border border-slate-200 bg-white/60 py-3.5 text-[15px] font-semibold text-slate-600 transition hover:bg-white active:scale-[0.99]"
        >
          Use sample receipt
        </button>
      </div>
    </div>
  );
}
