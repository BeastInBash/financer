"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { TrendPoint } from "@/app/lib/dashboard/types";
import { formatCurrency } from "@/app/lib/format";
import { Card, CardHeader } from "./card";

type SeriesKey = "expense" | "income" | "net";

const SERIES: { key: SeriesKey; label: string }[] = [
    { key: "expense", label: "Expense" },
    { key: "income", label: "Income" },
    { key: "net", label: "Net" },
];

const W = 600;
const H = 220;
const PAD = 10;

export function SpendingTrend({
    trend,
    currency,
}: {
    trend: TrendPoint[];
    currency: string;
}) {
    const reduce = useReducedMotion();
    const [active, setActive] = useState<SeriesKey>("expense");
    const [hover, setHover] = useState<number | null>(null);

    const values = useMemo(
        () =>
            trend.map((t) =>
                active === "net" ? t.income - t.expense : active === "income" ? t.income : t.expense,
            ),
        [trend, active],
    );

    const geom = useMemo(() => {
        const min = Math.min(0, ...values);
        const max = Math.max(...values, 1);
        const range = max - min || 1;
        const innerW = W - PAD * 2;
        const innerH = H - PAD * 2;
        const x = (i: number) =>
            values.length <= 1 ? PAD : PAD + (i / (values.length - 1)) * innerW;
        const y = (v: number) => H - PAD - ((v - min) / range) * innerH;
        const baselineY = y(0);
        const points = values.map((v, i) => ({ x: x(i), y: y(v), v }));
        const line = points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
        const area = `${PAD},${baselineY} ${line} ${(W - PAD).toFixed(1)},${baselineY}`;
        return { points, line, area, baselineY };
    }, [values]);

    const total = values.reduce((a, b) => a + b, 0);
    const active$ = formatCurrency(total, currency, { compact: true });

    function onMove(e: React.PointerEvent<SVGSVGElement>) {
        const rect = e.currentTarget.getBoundingClientRect();
        const ratio = (e.clientX - rect.left) / rect.width;
        const idx = Math.round(ratio * (trend.length - 1));
        setHover(Math.min(trend.length - 1, Math.max(0, idx)));
    }

    const hp = hover != null ? geom.points[hover] : null;

    return (
        <Card>
            <CardHeader
                title="Cash-Flow Trend · 12M"
                action={
                    <div className="flex border border-outline-variant">
                        {SERIES.map((s) => {
                            const on = s.key === active;
                            return (
                                <button
                                    key={s.key}
                                    type="button"
                                    onClick={() => setActive(s.key)}
                                    className={`relative px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.06em] transition-colors sm:px-3 ${
                                        on ? "text-on-accent" : "text-on-surface-variant hover:text-on-surface"
                                    }`}
                                >
                                    {on && (
                                        <motion.span
                                            layoutId="trend-tab"
                                            className="absolute inset-0 -z-0 bg-accent"
                                            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                                        />
                                    )}
                                    <span className="relative z-10">{s.label}</span>
                                </button>
                            );
                        })}
                    </div>
                }
            />
            <div className="p-4 sm:p-5">
                <div className="flex items-baseline justify-between">
                    <div className="font-sans text-2xl font-bold tracking-[-0.02em] text-on-surface">
                        {hp ? formatCurrency(hp.v, currency, { compact: true }) : active$}
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-outline">
                        {hover != null ? trend[hover].label : "Trailing total"}
                    </span>
                </div>

                <div className="relative mt-4">
                    <svg
                        viewBox={`0 0 ${W} ${H}`}
                        preserveAspectRatio="none"
                        className="h-48 w-full touch-none sm:h-56"
                        onPointerMove={onMove}
                        onPointerLeave={() => setHover(null)}
                    >
                        {[0, 0.25, 0.5, 0.75, 1].map((g) => (
                            <line
                                key={g}
                                x1={PAD}
                                x2={W - PAD}
                                y1={PAD + g * (H - PAD * 2)}
                                y2={PAD + g * (H - PAD * 2)}
                                stroke="#f0f0f0"
                                strokeWidth={1}
                                vectorEffect="non-scaling-stroke"
                            />
                        ))}

                        <AnimatePresence mode="wait">
                            <motion.g
                                key={active}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.25 }}
                            >
                                <motion.polygon
                                    points={geom.area}
                                    fill="var(--color-accent)"
                                    initial={reduce ? false : { opacity: 0 }}
                                    animate={{ opacity: 0.08 }}
                                    transition={{ duration: 0.6, delay: 0.2 }}
                                />
                                <motion.polyline
                                    points={geom.line}
                                    fill="none"
                                    stroke="var(--color-accent)"
                                    strokeWidth={2}
                                    strokeLinejoin="round"
                                    strokeLinecap="round"
                                    vectorEffect="non-scaling-stroke"
                                    initial={reduce ? false : { pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                                />
                            </motion.g>
                        </AnimatePresence>

                        {hp && (
                            <g>
                                <line
                                    x1={hp.x}
                                    x2={hp.x}
                                    y1={PAD}
                                    y2={H - PAD}
                                    stroke="var(--color-on-surface)"
                                    strokeWidth={1}
                                    strokeDasharray="3 3"
                                    vectorEffect="non-scaling-stroke"
                                />
                                <rect
                                    x={hp.x - 4}
                                    y={hp.y - 4}
                                    width={8}
                                    height={8}
                                    fill="var(--color-accent)"
                                    vectorEffect="non-scaling-stroke"
                                />
                            </g>
                        )}
                    </svg>

                    <div className="mt-2 flex justify-between font-mono text-[9px] uppercase tracking-[0.04em] text-outline">
                        {trend.map((t, i) => (
                            <span
                                key={`${t.label}-${i}`}
                                className={i % 2 === 0 ? "" : "hidden sm:inline"}
                            >
                                {t.label}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </Card>
    );
}
