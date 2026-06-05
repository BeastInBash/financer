"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Bell, Plus, Search } from "lucide-react";
import { ScanBar, Shimmer as Block } from "@/app/components/skeleton";

const EASE = [0.16, 1, 0.3, 1] as const;

// Mirrors the real dashboard chrome (Topbar / KPI strip / analytics grid /
// status bar) so the skeleton hands off to the live page with no layout shift.
export default function DashboardLoading() {
    return (
        <div className="relative flex min-h-screen flex-col">
            <ScanBar />

            {/* Topbar skeleton — mirrors topbar.tsx (h-16, search, actions). */}
            <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-3 border-b border-outline-variant bg-surface/90 px-4 backdrop-blur-sm lg:px-6">
                <div className="hidden min-w-0 flex-col gap-1.5 md:flex">
                    <Block className="h-2 w-16" />
                    <Block className="h-3 w-28" />
                </div>

                <label className="ml-auto flex h-10 w-full max-w-xs items-center gap-2 bg-surface-low px-3 text-outline md:ml-4 md:mr-auto">
                    <Search size={15} strokeWidth={2} className="shrink-0" />
                    <Block className="h-2.5 w-28" />
                </label>

                <nav className="hidden items-center gap-5 lg:flex">
                    <Block className="h-2.5 w-16" />
                    <Block className="h-2.5 w-16" />
                    <Block className="h-2.5 w-12" />
                </nav>

                <div className="flex items-center gap-3">
                    <span className="inline-flex h-10 items-center gap-2 bg-ink px-3 text-white sm:px-4">
                        <Plus size={15} strokeWidth={2.25} />
                        <span className="hidden font-mono text-[12px] font-medium uppercase tracking-[0.08em] sm:inline">
                            Add Entry
                        </span>
                    </span>
                    <span className="grid size-10 place-items-center border border-outline-variant text-outline-variant">
                        <Bell size={17} strokeWidth={1.75} />
                    </span>
                </div>
            </header>

            <div className="flex-1 space-y-4 p-4 lg:p-6">
                {/* KPI strip — 4 light cards + 1 dark health card. */}
                <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-[repeat(4,1fr)_1.4fr]">
                    {[0, 1, 2, 3].map((i) => (
                        <KpiSkeleton key={i} index={i} />
                    ))}
                    <HealthSkeleton />
                </section>

                {/* Primary grid: 2/3 analytics + 1/3 rail. */}
                <section className="grid gap-4 xl:grid-cols-3">
                    <div className="space-y-4 xl:col-span-2">
                        <ChartSkeleton />

                        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
                            <PanelSkeleton rows={5} />
                            <PanelSkeleton rows={4} />
                        </div>

                        <PanelSkeleton rows={6} />
                    </div>

                    <div className="space-y-4">
                        <PanelSkeleton rows={4} />
                        <PanelSkeleton rows={3} />
                        <PanelSkeleton rows={4} />
                    </div>
                </section>
            </div>

            <LoadingStatusBar />
        </div>
    );
}

/* ── Animated primitives ───────────────────────────────────────────────── */

function CardShell({
    children,
    className = "",
    index = 0,
}: {
    children: React.ReactNode;
    className?: string;
    index?: number;
}) {
    const reduce = useReducedMotion();
    return (
        <motion.div
            className={`border border-outline-variant bg-background ${className}`}
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={reduce ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: index * 0.05, ease: EASE }}
        >
            {children}
        </motion.div>
    );
}

function KpiSkeleton({ index }: { index: number }) {
    return (
        <CardShell index={index} className="flex flex-col justify-between gap-5 p-4 sm:p-5">
            <Block className="h-2.5 w-20" delay={index * 0.12} />
            <div>
                <Block className="h-8 w-32" delay={index * 0.12} />
                <Block className="mt-3 h-2.5 w-16" delay={index * 0.12} />
            </div>
        </CardShell>
    );
}

function HealthSkeleton() {
    return (
        <CardShell index={4} className="relative overflow-hidden border-ink bg-ink p-4 sm:col-span-2 sm:p-5 xl:col-span-1">
            <span className="block h-2.5 w-28 bg-white/15" />
            <div className="mt-4 h-9 w-20 bg-white/15" />
            <div className="mt-4 h-1 w-full overflow-hidden bg-white/15">
                <motion.div
                    className="h-full bg-accent"
                    initial={{ width: "0%" }}
                    animate={{ width: ["0%", "70%", "0%"] }}
                    transition={{ duration: 2.4, ease: EASE, repeat: Infinity }}
                />
            </div>
            <span className="mt-3 block h-2.5 w-24 bg-white/15" />
        </CardShell>
    );
}

function ChartSkeleton() {
    const reduce = useReducedMotion();
    // 24 vertical bars that gently breathe to suggest live data streaming in.
    const bars = Array.from({ length: 24 });
    return (
        <CardShell className="p-4 sm:p-5">
            <div className="flex items-center justify-between border-b border-outline-variant pb-4">
                <Block className="h-3 w-40" />
                <Block className="h-2.5 w-20" />
            </div>
            <div className="flex h-44 items-end gap-1.5 pt-5">
                {bars.map((_, i) => {
                    const base = 25 + ((i * 37) % 60);
                    return (
                        <motion.span
                            key={i}
                            className="flex-1 bg-surface-container"
                            style={{ height: `${base}%` }}
                            initial={false}
                            animate={
                                reduce
                                    ? undefined
                                    : { height: [`${base}%`, `${Math.min(95, base + 18)}%`, `${base}%`] }
                            }
                            transition={{
                                duration: 1.8,
                                ease: "easeInOut",
                                repeat: Infinity,
                                delay: (i % 8) * 0.09,
                            }}
                        />
                    );
                })}
            </div>
        </CardShell>
    );
}

function PanelSkeleton({ rows }: { rows: number }) {
    return (
        <CardShell className="p-4 sm:p-5">
            <div className="flex items-center justify-between border-b border-outline-variant pb-4">
                <Block className="h-3 w-32" />
                <Block className="h-2.5 w-10" />
            </div>
            <div className="space-y-3 pt-4">
                {Array.from({ length: rows }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                            <Block className="size-7 shrink-0" delay={i * 0.08} />
                            <Block className="h-2.5 w-24" delay={i * 0.08} />
                        </div>
                        <Block className="h-2.5 w-14" delay={i * 0.08} />
                    </div>
                ))}
            </div>
        </CardShell>
    );
}

/* ── Status bar with cycling boot sequence ─────────────────────────────── */

const BOOT_STAGES = [
    "Authenticating session",
    "Resolving ledger",
    "Aggregating positions",
    "Rendering interface",
] as const;

function LoadingStatusBar() {
    const reduce = useReducedMotion();
    const [stage, setStage] = useState(0);

    useEffect(() => {
        if (reduce) return;
        const id = setInterval(() => setStage((s) => (s + 1) % BOOT_STAGES.length), 1100);
        return () => clearInterval(id);
    }, [reduce]);

    return (
        <footer className="sticky bottom-0 z-10 flex items-center justify-between gap-4 border-t border-outline-variant bg-surface px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.08em] text-outline lg:px-6">
            <span className="flex items-center gap-2 text-on-surface-variant">
                <span className="size-2 animate-pulse bg-accent" />
                <span className="flex items-center gap-1">
                    <AnimatePresence mode="wait">
                        <motion.span
                            key={stage}
                            initial={reduce ? false : { opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={reduce ? undefined : { opacity: 0, y: -4 }}
                            transition={{ duration: 0.25, ease: EASE }}
                        >
                            {BOOT_STAGES[stage]}
                        </motion.span>
                    </AnimatePresence>
                    <Ellipsis />
                </span>
            </span>
            <span className="hidden gap-5 sm:flex">
                <span>Latency: --ms</span>
                <span>Establishing secure session</span>
                <span className="hidden md:inline">Secure_Node: TLS_1.3</span>
            </span>
        </footer>
    );
}

/** Animated "..." that fills one dot at a time. */
function Ellipsis() {
    const reduce = useReducedMotion();
    if (reduce) return <span>…</span>;
    return (
        <span className="inline-flex w-3">
            {[0, 1, 2].map((i) => (
                <motion.span
                    key={i}
                    animate={{ opacity: [0.2, 1, 0.2] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                >
                    .
                </motion.span>
            ))}
        </span>
    );
}
