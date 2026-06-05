"use client";

import { motion, useReducedMotion } from "motion/react";
import { ArrowLeft } from "lucide-react";
import { ScanBar, Shimmer } from "@/app/components/skeleton";

const EASE = [0.16, 1, 0.3, 1] as const;

// Segment loading UI for /entry/new. Renders instantly inside entry/layout.tsx
// (sidebar stays put) while the server component loads the user's accounts/
// categories, then hands off to <NewEntryForm> with no layout shift.
export default function NewEntryLoading() {
    return (
        <div className="flex min-h-screen flex-col">
            <ScanBar />

            {/* Header skeleton — mirrors new-entry-form.tsx header. */}
            <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-3 border-b border-outline-variant bg-surface/90 px-4 backdrop-blur-sm lg:px-6">
                <span className="grid size-10 place-items-center border border-outline-variant text-outline-variant">
                    <ArrowLeft size={17} strokeWidth={1.75} />
                </span>
                <div className="flex min-w-0 flex-col gap-1.5">
                    <Shimmer className="h-2 w-12" />
                    <Shimmer className="h-3 w-24" />
                </div>
            </header>

            <div className="mx-auto w-full max-w-3xl flex-1 p-4 lg:p-6">
                <CardSkeleton>
                    {/* Card header — mirrors CardHeader "Transaction Detail". */}
                    <div className="flex items-center justify-between border-b border-outline-variant px-4 py-3.5 sm:px-6">
                        <Shimmer className="h-3 w-40" />
                        <Pulse />
                    </div>

                    <div className="space-y-6 p-4 sm:p-6">
                        {/* Type selector — 3 segmented cells. */}
                        <FieldSkeleton labelWidth="w-12">
                            <div className="grid grid-cols-3 border border-outline-variant">
                                {[0, 1, 2].map((i) => (
                                    <div
                                        key={i}
                                        className={`flex h-11 items-center justify-center ${
                                            i < 2 ? "border-r border-outline-variant" : ""
                                        }`}
                                    >
                                        <Shimmer className="h-2.5 w-16" delay={i * 0.12} />
                                    </div>
                                ))}
                            </div>
                        </FieldSkeleton>

                        {/* Amount — tall field with currency prefix cell. */}
                        <FieldSkeleton labelWidth="w-16">
                            <div className="flex h-14 items-stretch border border-outline-variant bg-background">
                                <div className="grid w-16 place-items-center border-r border-outline-variant">
                                    <Shimmer className="h-2.5 w-7" />
                                </div>
                                <div className="flex flex-1 items-center px-4">
                                    <Shimmer className="h-6 w-28" />
                                </div>
                            </div>
                        </FieldSkeleton>

                        {/* Title */}
                        <FieldSkeleton labelWidth="w-10">
                            <InputBox />
                        </FieldSkeleton>

                        {/* Account + Category */}
                        <div className="grid gap-6 sm:grid-cols-2">
                            <FieldSkeleton labelWidth="w-16">
                                <InputBox />
                            </FieldSkeleton>
                            <FieldSkeleton labelWidth="w-20">
                                <InputBox />
                            </FieldSkeleton>
                        </div>

                        {/* Date + Tags */}
                        <div className="grid gap-6 sm:grid-cols-2">
                            <FieldSkeleton labelWidth="w-10">
                                <InputBox />
                            </FieldSkeleton>
                            <FieldSkeleton labelWidth="w-12">
                                <InputBox />
                            </FieldSkeleton>
                        </div>

                        {/* Notes */}
                        <FieldSkeleton labelWidth="w-14">
                            <Shimmer className="h-[4.75rem] w-full" />
                        </FieldSkeleton>

                        {/* Receipt dropzone */}
                        <FieldSkeleton labelWidth="w-16">
                            <div className="grid h-24 place-items-center border border-dashed border-outline-variant">
                                <Shimmer className="h-2.5 w-40" />
                            </div>
                        </FieldSkeleton>

                        {/* Footer */}
                        <div className="flex flex-col-reverse items-stretch gap-3 border-t border-outline-variant pt-5 sm:flex-row sm:items-center sm:justify-between">
                            <Shimmer className="h-2.5 w-32" />
                            <div className="flex items-center gap-3">
                                <span className="grid h-11 flex-1 place-items-center border border-outline-variant px-5 sm:flex-none sm:w-24">
                                    <Shimmer className="h-2.5 w-12" />
                                </span>
                                <span className="grid h-11 flex-1 place-items-center bg-ink px-6 sm:flex-none sm:w-32">
                                    <Shimmer className="h-2.5 w-16 opacity-40" />
                                </span>
                            </div>
                        </div>
                    </div>
                </CardSkeleton>
            </div>
        </div>
    );
}

/* ── Local helpers ─────────────────────────────────────────────────────── */

function CardSkeleton({ children }: { children: React.ReactNode }) {
    const reduce = useReducedMotion();
    return (
        <motion.div
            className="border border-outline-variant bg-background"
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={reduce ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
        >
            {children}
        </motion.div>
    );
}

function FieldSkeleton({
    children,
    labelWidth,
}: {
    children: React.ReactNode;
    labelWidth: string;
}) {
    return (
        <div>
            <Shimmer className={`h-2.5 ${labelWidth}`} />
            <div className="mt-2">{children}</div>
        </div>
    );
}

function InputBox() {
    return <Shimmer className="h-11 w-full" />;
}

/** Pulsing accent square — a small "working" indicator in the card header. */
function Pulse() {
    const reduce = useReducedMotion();
    if (reduce) return <span className="size-2 bg-accent/40" />;
    return (
        <motion.span
            className="size-2 bg-accent"
            animate={{ opacity: [1, 0.25, 1] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
        />
    );
}
