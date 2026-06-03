"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { FileText, Upload, X } from "lucide-react";

const ACCEPTED = ["image/png", "image/jpeg", "image/webp", "image/gif", "application/pdf"];
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

function formatBytes(n: number): string {
    if (n < 1024) return `${n} B`;
    if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
    return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

export function ReceiptUpload({
    value,
    onChange,
}: {
    value: File | null;
    onChange: (file: File | null) => void;
}) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [dragging, setDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Thumbnail for image receipts. Derived from the file, then revoked on
    // change/unmount so we never leak object URLs.
    const previewUrl = useMemo(
        () => (value && value.type.startsWith("image/") ? URL.createObjectURL(value) : null),
        [value],
    );
    useEffect(() => {
        if (!previewUrl) return;
        return () => URL.revokeObjectURL(previewUrl);
    }, [previewUrl]);

    function accept(file: File) {
        if (!ACCEPTED.includes(file.type)) {
            setError("Use a PNG, JPG, WEBP, GIF, or PDF file");
            return;
        }
        if (file.size > MAX_BYTES) {
            setError("File exceeds the 10 MB limit");
            return;
        }
        setError(null);
        onChange(file);
    }

    function handleInput(e: ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) accept(file);
        e.target.value = ""; // allow re-selecting the same file
    }

    function handleDrop(e: DragEvent<HTMLButtonElement>) {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) accept(file);
    }

    if (value) {
        const isPdf = value.type === "application/pdf";
        return (
            <div className="flex items-center gap-3 border border-outline-variant p-3">
                {previewUrl ? (
                    // Blob preview — next/image can't optimize object URLs.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={previewUrl}
                        alt="Receipt preview"
                        className="size-12 shrink-0 border border-outline-variant object-cover"
                    />
                ) : (
                    <span className="grid size-12 shrink-0 place-items-center border border-outline-variant text-outline">
                        <FileText size={18} strokeWidth={1.75} />
                    </span>
                )}
                <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-on-surface">{value.name}</p>
                    <p className="font-mono text-[10px] uppercase tracking-[0.06em] text-outline">
                        {isPdf ? "PDF" : "Image"} · {formatBytes(value.size)}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => {
                        onChange(null);
                        setError(null);
                    }}
                    aria-label="Remove receipt"
                    className="grid size-8 shrink-0 place-items-center border border-outline-variant text-outline transition-colors hover:border-ink hover:text-on-surface"
                >
                    <X size={15} strokeWidth={2} />
                </button>
            </div>
        );
    }

    return (
        <div>
            <button
                type="button"
                onClick={() => inputRef.current?.click()}
                onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                className={`flex w-full flex-col items-center justify-center gap-2 border border-dashed px-4 py-6 text-center transition-colors ${
                    dragging
                        ? "border-accent bg-accent/5"
                        : "border-outline-variant hover:border-ink"
                }`}
            >
                <Upload
                    size={20}
                    strokeWidth={1.75}
                    className={dragging ? "text-accent" : "text-outline"}
                />
                <span className="font-mono text-[11px] uppercase tracking-[0.06em] text-on-surface-variant">
                    Drop receipt or <span className="text-accent">browse</span>
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.05em] text-outline">
                    PNG · JPG · WEBP · PDF · max 10MB
                </span>
            </button>
            <input
                ref={inputRef}
                type="file"
                accept={ACCEPTED.join(",")}
                onChange={handleInput}
                className="hidden"
            />
            {error && (
                <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.05em] text-[#ba1a1a]">
                    {error}
                </p>
            )}
        </div>
    );
}
