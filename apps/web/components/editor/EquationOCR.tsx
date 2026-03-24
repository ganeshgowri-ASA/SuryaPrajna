"use client";

import { useState, useRef, useCallback } from "react";

interface EquationOCRProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (latex: string) => void;
}

export default function EquationOCR({ isOpen, onClose, onInsert }: EquationOCRProps) {
  const [imageData, setImageData] = useState<string | null>(null);
  const [latex, setLatex] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const processImage = useCallback(async (base64: string) => {
    setIsProcessing(true);
    setError(null);
    try {
      const res = await fetch("/api/equation-ocr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64 }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setLatex(data.latex || "");
      setConfidence(data.confidence || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "OCR processing failed");
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImageData(result);
      processImage(result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          setImageData(result);
          processImage(result);
        };
        reader.readAsDataURL(file);
      }
    },
    [processImage]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      const items = e.clipboardData.items;
      for (const item of Array.from(items)) {
        if (item.type.startsWith("image/")) {
          const blob = item.getAsFile();
          if (blob) {
            const reader = new FileReader();
            reader.onload = () => {
              const result = reader.result as string;
              setImageData(result);
              processImage(result);
            };
            reader.readAsDataURL(blob);
          }
          break;
        }
      }
    },
    [processImage]
  );

  const handleInsert = () => {
    if (latex) {
      onInsert(`$$${latex}$$`);
      handleReset();
      onClose();
    }
  };

  const handleReset = () => {
    setImageData(null);
    setLatex("");
    setError(null);
    setConfidence(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={onClose}>
      <div
        className="bg-zinc-900 rounded-xl border border-zinc-700 w-[600px] max-h-[80vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        onPaste={handlePaste}
      >
        <div className="flex items-center justify-between p-4 border-b border-zinc-700">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <h2 className="text-lg font-semibold text-zinc-100">Equation OCR</h2>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-200">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 space-y-4">
          {!imageData ? (
            <div
              ref={dropZoneRef}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="border-2 border-dashed border-zinc-600 rounded-lg p-8 text-center hover:border-emerald-500 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <svg className="w-12 h-12 mx-auto mb-3 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-sm text-zinc-400 mb-1">Drop an image, paste from clipboard, or click to upload</p>
              <p className="text-xs text-zinc-500">Supports screenshots, photos of handwritten equations, PDF crops</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-3">
              <div className="relative bg-zinc-800 rounded-lg overflow-hidden">
                <img src={imageData} alt="Equation" className="max-h-48 mx-auto object-contain" />
                <button
                  onClick={handleReset}
                  className="absolute top-2 right-2 p-1 bg-zinc-700 rounded hover:bg-zinc-600"
                >
                  <svg className="w-4 h-4 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {isProcessing && (
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <div className="animate-spin w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full" />
              Recognizing equation...
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-900/30 border border-red-700 rounded-lg text-sm text-red-300">
              {error}
            </div>
          )}

          {latex && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-zinc-300">Recognized LaTeX</label>
                {confidence !== null && (
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    confidence > 0.8 ? "bg-emerald-900/50 text-emerald-300" :
                    confidence > 0.5 ? "bg-yellow-900/50 text-yellow-300" :
                    "bg-red-900/50 text-red-300"
                  }`}>
                    {Math.round(confidence * 100)}% confidence
                  </span>
                )}
              </div>
              <textarea
                value={latex}
                onChange={(e) => setLatex(e.target.value)}
                className="w-full h-24 px-3 py-2 text-sm font-mono bg-zinc-800 border border-zinc-600 rounded-lg text-zinc-200 focus:outline-none focus:border-emerald-500 resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleInsert}
                  className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Insert into Editor
                </button>
                <button
                  onClick={() => navigator.clipboard.writeText(latex)}
                  className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-zinc-200 rounded-lg text-sm transition-colors"
                >
                  Copy LaTeX
                </button>
              </div>
            </div>
          )}

          <p className="text-xs text-zinc-600 text-center">
            Keyboard shortcut: Ctrl+Shift+E | Powered by Pix2Text (open source)
          </p>
        </div>
      </div>
    </div>
  );
}
