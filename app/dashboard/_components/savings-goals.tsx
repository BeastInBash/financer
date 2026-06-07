"use client";

import { GoalStatus } from "@/app/generated/prisma/enums";
import type { GoalRow } from "@/app/lib/dashboard/types";
import { formatCurrency, formatPct } from "@/app/lib/format";
import { Card, CardHeader } from "./card";
import { ProgressBar, StaggerItem, StaggerList } from "./motion-primitives";

const STATUS_META: Record<GoalStatus, { glyph: string; cls: string }> = {
    [GoalStatus.ACTIVE]: { glyph: "◇", cls: "text-accent" },
    [GoalStatus.COMPLETED]: { glyph: "■", cls: "text-on-surface" },
    [GoalStatus.CANCELLED]: { glyph: "△", cls: "text-outline" },
};

export function SavingsGoals({
    goals,
    currency,
}: {
    goals: GoalRow[];
    currency: string;
}) {
    return (
        <Card>
            <CardHeader title="Savings Goals" />
            {goals.length === 0 ? (
                <p className="p-5 font-mono text-[11px] uppercase tracking-[0.06em] text-outline">
                    No savings goals
                </p>
            ) : (
                <StaggerList className="space-y-5 p-4 sm:p-5">
                    {goals.map((g) => {
                        const meta = STATUS_META[g.status];
                        const done = g.status === GoalStatus.COMPLETED || g.pct >= 1;
                        return (
                            <StaggerItem key={g.id}>
                                <div className="flex items-baseline justify-between gap-2">
                                    <span className="flex min-w-0 items-center gap-2">
                                        <span className={`shrink-0 text-[11px] ${meta.cls}`}>
                                            {meta.glyph}
                                        </span>
                                        <span className="truncate text-[13px] font-medium text-on-surface">
                                            {g.title}
                                        </span>
                                    </span>
                                    <span className="shrink-0 font-mono text-[11px] text-on-surface-variant">
                                        {formatPct(g.pct)}
                                    </span>
                                </div>
                                <div className="mt-2">
                                    <ProgressBar value={g.pct} tone={done ? "accent" : "ink"} className="h-1" />
                                </div>
                                <div className="mt-1.5 flex justify-between font-mono text-[10px] uppercase tracking-[0.04em] text-outline">
                                    <span>{formatCurrency(g.currentAmount, currency)}</span>
                                    <span>{formatCurrency(g.targetAmount, currency)}</span>
                                </div>
                            </StaggerItem>
                        );
                    })}
                </StaggerList>
            )}
        </Card>
    );
}
