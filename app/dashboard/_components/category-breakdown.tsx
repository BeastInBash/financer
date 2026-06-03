"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import type { CategorySlice } from "@/app/lib/dashboard/types";
import { formatCurrency, formatPct } from "@/app/lib/format";
import { Card, CardHeader } from "./card";

export function CategoryBreakdown({
    categories,
    currency,
}: {
    categories: CategorySlice[];
    currency: string;
}) {
    const reduce = useReducedMotion();
    const [active, setActive] = useState<number | null>(null);
    const maxPct = Math.max(...categories.map((c) => c.pct), 0.0001);

    return (
        <Card className="flex-1">
            <CardHeader title="Spend by Category" />
            <div className="flex flex-1 flex-col justify-end gap-4 p-4 sm:p-5">
                <div
                    className="flex h-44 items-end justify-between gap-2 sm:h-48"
                    onPointerLeave={() => setActive(null)}
                >
                    {categories.map((c, i) => {
                        const on = active === i;
                        const dim = active != null && !on;
                        return (
                            <button
                                key={c.id}
                                type="button"
                                onPointerEnter={() => setActive(i)}
                                onFocus={() => setActive(i)}
                                className="group flex h-full flex-1 cursor-default flex-col items-center justify-end gap-2"
                            >
                                <motion.div
                                    className={`w-full ${i === 0 ? "bg-accent" : "bg-ink"}`}
                                    style={{ opacity: dim ? 0.35 : 1 }}
                                    initial={reduce ? false : { height: 0 }}
                                    whileInView={
                                        reduce ? undefined : { height: `${(c.pct / maxPct) * 100}%` }
                                    }
                                    viewport={{ once: true, margin: "-6%" }}
                                    transition={{ duration: 0.7, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                                />
                                <span className="font-mono text-[10px] uppercase tracking-[0.04em] text-outline">
                                    {c.name.slice(0, 3)}
                                </span>
                            </button>
                        );
                    })}
                </div>

                <div className="min-h-[34px] border-t border-outline-variant pt-3">
                    {active != null ? (
                        <motion.div
                            key={active}
                            initial={reduce ? false : { opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                            className="flex items-center justify-between"
                        >
                            <span className="font-mono text-[11px] uppercase tracking-[0.06em] text-on-surface">
                                {categories[active].name}
                            </span>
                            <span className="font-mono text-[12px] text-on-surface">
                                {formatCurrency(categories[active].amount, currency)} ·{" "}
                                {formatPct(categories[active].pct)}
                            </span>
                        </motion.div>
                    ) : (
                        <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-outline">
                            Hover a bar for detail
                        </span>
                    )}
                </div>
            </div>
        </Card>
    );
}
