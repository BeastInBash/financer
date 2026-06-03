"use client";

import { motion, useReducedMotion } from "motion/react";
import { ArrowDownRight, ArrowUpRight, TrendingUp } from "lucide-react";
import type { KpiData } from "@/app/lib/dashboard/types";
import { formatCurrency, formatPct } from "@/app/lib/format";
import { Label } from "./card";
import { AnimatedNumber } from "./motion-primitives";

const EASE = [0.16, 1, 0.3, 1] as const;

function Delta({ value, invert = false }: { value: number | null; invert?: boolean }) {
    if (value == null) {
        return <span className="text-outline">NO BASELINE</span>;
    }
    // For expense, a decrease is "good" (positive tone).
    const good = invert ? value <= 0 : value >= 0;
    const Icon = value >= 0 ? ArrowUpRight : ArrowDownRight;
    return (
        <span className={`flex items-center gap-1 ${good ? "text-accent" : "text-[#ba1a1a]"}`}>
            <Icon size={12} strokeWidth={2.25} />
            {formatPct(value, { sign: true })}
        </span>
    );
}

function KpiCard({
    label,
    children,
    foot,
    index,
}: {
    label: string;
    children: React.ReactNode;
    foot: React.ReactNode;
    index: number;
}) {
    const reduce = useReducedMotion();
    return (
        <motion.div
            className="flex flex-col justify-between gap-5 border border-outline-variant bg-background p-4 transition-colors hover:border-ink sm:p-5"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={reduce ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.07, ease: EASE }}
            whileHover={reduce ? undefined : { y: -3 }}
        >
            <Label>{label}</Label>
            <div>
                <div className="font-sans text-[28px] font-bold leading-none tracking-[-0.02em] text-on-surface lg:text-[32px]">
                    {children}
                </div>
                <div className="mt-2.5 flex items-center gap-1 font-mono text-[11px] uppercase tracking-[0.06em]">
                    {foot}
                </div>
            </div>
        </motion.div>
    );
}

export function KpiCards({ kpi, currency }: { kpi: KpiData; currency: string }) {
    const money = (v: number) => formatCurrency(v, currency, { compact: true });

    return (
        <>
            <KpiCard
                index={0}
                label="Net Worth"
                foot={<Delta value={kpi.incomeDeltaPct} />}
            >
                <AnimatedNumber value={kpi.netWorth} format={money} />
            </KpiCard>

            <KpiCard
                index={1}
                label="Income · MTD"
                foot={<Delta value={kpi.incomeDeltaPct} />}
            >
                <AnimatedNumber value={kpi.income} format={money} />
            </KpiCard>

            <KpiCard
                index={2}
                label="Expense · MTD"
                foot={<Delta value={kpi.expenseDeltaPct} invert />}
            >
                <AnimatedNumber value={kpi.expense} format={money} />
            </KpiCard>

            <KpiCard
                index={3}
                label="Net Savings"
                foot={
                    <span className="flex items-center gap-1 text-accent">
                        <TrendingUp size={12} strokeWidth={2.25} />
                        {formatPct(kpi.savingsRate)} RATE
                    </span>
                }
            >
                <AnimatedNumber value={kpi.netSavings} format={money} />
            </KpiCard>

            <HealthCard score={kpi.healthScore} />
        </>
    );
}

function HealthCard({ score }: { score: number }) {
    const reduce = useReducedMotion();
    const label =
        score >= 80 ? "OPTIMAL" : score >= 60 ? "STABLE" : score >= 40 ? "WATCH" : "AT RISK";

    return (
        <motion.div
            className="relative overflow-hidden border border-ink bg-ink p-4 text-white sm:col-span-2 sm:p-5 xl:col-span-1"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={reduce ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.28, ease: EASE }}
        >
            <TrendingUp
                aria-hidden
                size={140}
                strokeWidth={1}
                className="pointer-events-none absolute -right-6 -top-4 text-white/5"
            />
            <span className="font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-white/60">
                Financial Health
            </span>
            <div className="mt-3 flex items-baseline gap-2">
                <AnimatedNumber
                    value={score}
                    format={(v) => String(Math.round(v))}
                    className="font-sans text-5xl font-bold tracking-[-0.02em]"
                />
                <span className="font-mono text-[12px] text-white/50">/ 100</span>
            </div>
            <div className="mt-4 h-1 w-full overflow-hidden bg-white/15">
                <motion.div
                    className="h-full bg-accent"
                    initial={reduce ? false : { width: 0 }}
                    animate={reduce ? undefined : { width: `${score}%` }}
                    style={reduce ? { width: `${score}%` } : undefined}
                    transition={{ duration: 1, delay: 0.4, ease: EASE }}
                />
            </div>
            <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.08em] text-accent">
                ◇ {label}
            </p>
        </motion.div>
    );
}
