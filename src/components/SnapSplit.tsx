"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { ParsedReceipt, Person, Step } from "@/lib/types";
import { uid } from "@/lib/format";
import { compressImage } from "@/lib/compress";
import { runReceiptPipeline } from "@/lib/pipeline";
import PeopleScreen from "./PeopleScreen";
import UploadScreen from "./UploadScreen";
import ProcessingScreen from "./ProcessingScreen";
import SplitScreen from "./SplitScreen";

const STEPS: Step[] = ["people", "upload", "processing", "split"];

export default function SnapSplit() {
  const [step, setStep] = useState<Step>("people");
  const [people, setPeople] = useState<Person[]>([
    { id: uid("p"), name: "" },
  ]);
  const [receipt, setReceipt] = useState<ParsedReceipt | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);

  const stepIndex = STEPS.indexOf(step);

  const pickImage = async (file: File) => {
    try {
      const { blob, dataUrl } = await compressImage(file);
      setImageBlob(blob);
      setPreview(dataUrl);
    } catch {
      // If compression fails, keep going — sample fallback covers the demo.
      setImageBlob(null);
      setPreview(null);
    }
  };

  // compress->OCR->parse, always resolves to a receipt (sample on any failure).
  // Hold the processing screen for a minimum beat so the scan animation reads.
  const startProcessing = async (useSample: boolean) => {
    setStep("processing");
    const minDelay = new Promise((r) => setTimeout(r, 2400));
    const [{ receipt }] = await Promise.all([
      runReceiptPipeline(useSample ? null : imageBlob),
      minDelay,
    ]);
    setReceipt(receipt);
    setStep("split");
  };

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pb-8 pt-6">
      {/* Brand header */}
      <header className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-lg shadow-lg shadow-indigo-500/30">
            🧾
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900">
            Snap<span className="text-indigo-600">Split</span>
          </span>
        </div>
        {/* Step pips */}
        <div className="flex items-center gap-1.5">
          {STEPS.map((s, i) => (
            <motion.div
              key={s}
              animate={{
                width: i === stepIndex ? 22 : 7,
                opacity: i <= stepIndex ? 1 : 0.35,
              }}
              className="h-1.5 rounded-full bg-indigo-500"
            />
          ))}
        </div>
      </header>

      {/* Screen switcher */}
      <div className="relative flex-1">
        <AnimatePresence mode="wait">
          {step === "people" && (
            <Screen key="people">
              <PeopleScreen
                people={people}
                setPeople={setPeople}
                onContinue={() => setStep("upload")}
              />
            </Screen>
          )}

          {step === "upload" && (
            <Screen key="upload">
              <UploadScreen
                preview={preview}
                onPick={pickImage}
                onContinue={() => startProcessing(false)}
                onUseSample={() => startProcessing(true)}
                onBack={() => setStep("people")}
              />
            </Screen>
          )}

          {step === "processing" && (
            <Screen key="processing">
              <ProcessingScreen preview={preview} />
            </Screen>
          )}

          {step === "split" && receipt && (
            <Screen key="split">
              <SplitScreen
                receipt={receipt}
                people={people}
                onRestart={() => {
                  setReceipt(null);
                  setPreview(null);
                  setImageBlob(null);
                  setStep("people");
                }}
              />
            </Screen>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

function Screen({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="absolute inset-0 flex flex-col"
    >
      {children}
    </motion.div>
  );
}

