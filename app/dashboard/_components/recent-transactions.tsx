"use client";

import { motion, useReducedMotion } from "motion/react";
import { ArrowLeftRight, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { TransactionType } from "@/app/generated/prisma/enums";
import type { TransactionRow } from "@/app/lib/dashboard/types";
import { formatCurrency, formatDate } from "@/app/lib/format";
import { Card, CardHeader } from "./card";

const TYPE_META = {
    [TransactionType.INCOME]: { icon: ArrowDownLeft, cls: "text-accent", sign: 1 },
    [TransactionType.EXPENSE]: { icon: ArrowUpRight, cls: "text-on-surface", sign: -1 },
    [TransactionType.TRANSFER]: { icon: ArrowLeftRight, cls: "text-on-surface-variant", sign: 0 },
} as const;

export function RecentTransactions({
    transactions,
    currency,
}: {
    transactions: TransactionRow[];
    currency: string;
}) {
    const reduce = useReducedMotion();

    return (
        <Card>
            <CardHeader
                title="Recent Activity"
                action={
                    <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-outline">
                        {transactions.length} entries
                    </span>
                }
            />
            {transactions.length === 0 ? (
                <Empty />
            ) : (
                <ul>
                    {transactions.map((t, i) => {
                        const meta = TYPE_META[t.type];
                        const Icon = meta.icon;
                        return (
                            <motion.li
                                key={t.id}
                                initial={reduce ? false : { opacity: 0, x: -8 }}
                                whileInView={reduce ? undefined : { opacity: 1, x: 0 }}
                                viewport={{ once: true, margin: "-4%" }}
                                transition={{ duration: 0.4, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                                className="group flex items-center gap-3 border-b border-outline-variant px-4 py-3 transition-colors last:border-b-0 hover:bg-surface-low sm:px-5"
                            >
                                <span className="flex size-7 shrink-0 items-center justify-center border border-outline-variant text-outline transition-colors group-hover:border-ink group-hover:text-on-surface">
                                    <Icon size={14} strokeWidth={2} />
                                </span>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-[13px] font-medium text-on-surface">
                                        {t.title}
                                    </p>
                                    <p className="truncate font-mono text-[10px] uppercase tracking-[0.04em] text-outline">
                                        {t.accountName}
                                        {t.categoryName ? ` · ${t.categoryName}` : ""}
                                    </p>
                                </div>
                                <div className="shrink-0 text-right">
                                    <p className={`font-mono text-[13px] ${meta.cls}`}>
                                        {formatCurrency(meta.sign * t.amount, currency, {
                                            sign: meta.sign !== 0,
                                        })}
                                    </p>
                                    <p className="font-mono text-[10px] uppercase tracking-[0.04em] text-outline">
                                        {formatDate(t.date)}
                                    </p>
                                </div>
                            </motion.li>
                        );
                    })}
                </ul>
            )}
        </Card>
    );
}

function Empty() {
    return (
        <div className="flex flex-1 items-center justify-center p-8 font-mono text-[11px] uppercase tracking-[0.06em] text-outline">
            No transactions this month
        </div>
    );
}
