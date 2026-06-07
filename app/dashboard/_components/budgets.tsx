"use client";

import type { BudgetRow } from "@/app/lib/dashboard/types";
import { formatCurrency, formatPct } from "@/app/lib/format";
import { Card, CardHeader } from "./card";
import { ProgressBar, StaggerItem, StaggerList } from "./motion-primitives";

export function Budgets({
    budgets,
    currency,
}: {
    budgets: BudgetRow[];
    currency: string;
}) {
    return (
        <Card>
            <CardHeader title="Active Budgets" />
            {budgets.length === 0 ? (
                <p className="p-5 font-mono text-[11px] uppercase tracking-[0.06em] text-outline">
                    No active budgets
                </p>
            ) : (
                <StaggerList className="space-y-4 p-4 sm:p-5">
                    {budgets.map((b) => {
                        const over = b.pct > 1;
                        return (
                            <StaggerItem key={b.id}>
                                <div className="flex items-baseline justify-between gap-2">
                                    <span className="truncate font-mono text-[11px] uppercase tracking-[0.06em] text-on-surface-variant">
                                        {b.categoryName}
                                    </span>
                                    <span
                                        className={`shrink-0 font-mono text-[12px] ${
                                            over ? "text-[#ba1a1a]" : "text-on-surface"
                                        }`}
                                    >
                                        {formatCurrency(b.spent, currency)} /{" "}
                                        {formatCurrency(b.amount, currency)}
                                    </span>
                                </div>
                                <div className="mt-2 flex items-center gap-2">
                                    <ProgressBar value={b.pct} tone={over ? "error" : "ink"} />
                                    <span
                                        className={`w-12 shrink-0 text-right font-mono text-[10px] ${
                                            over ? "text-[#ba1a1a]" : "text-outline"
                                        }`}
                                    >
                                        {formatPct(b.pct)}
                                    </span>
                                </div>
                            </StaggerItem>
                        );
                    })}
                </StaggerList>
            )}
        </Card>
    );
}
