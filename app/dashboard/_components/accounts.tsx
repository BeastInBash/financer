"use client";

import { AccountType } from "@/app/generated/prisma/enums";
import { Banknote, CreditCard, Landmark, LineChart, Wallet } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { AccountRow } from "@/app/lib/dashboard/types";
import { formatCurrency } from "@/app/lib/format";
import { Card, CardHeader } from "./card";
import { StaggerItem, StaggerList } from "./motion-primitives";

const ACCOUNT_META: Record<AccountType, { icon: LucideIcon; label: string }> = {
    [AccountType.CASH]: { icon: Banknote, label: "Cash" },
    [AccountType.BANK]: { icon: Landmark, label: "Bank" },
    [AccountType.CREDIT_CARD]: { icon: CreditCard, label: "Credit" },
    [AccountType.WALLET]: { icon: Wallet, label: "Wallet" },
    [AccountType.INVESTMENT]: { icon: LineChart, label: "Invest" },
};

export function Accounts({ accounts }: { accounts: AccountRow[] }) {
    return (
        <Card>
            <CardHeader
                title="Accounts"
                action={
                    <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-outline">
                        {accounts.length}
                    </span>
                }
            />
            {accounts.length === 0 ? (
                <p className="p-5 font-mono text-[11px] uppercase tracking-[0.06em] text-outline">
                    No accounts
                </p>
            ) : (
                <StaggerList className="divide-y divide-outline-variant">
                    {accounts.map((a) => {
                        const meta = ACCOUNT_META[a.type];
                        const Icon = meta.icon;
                        const negative = a.balance < 0;
                        return (
                            <StaggerItem
                                key={a.id}
                                className="flex items-center gap-3 p-4 transition-colors hover:bg-surface-low sm:px-5"
                            >
                                <span className="flex size-8 shrink-0 items-center justify-center border border-outline-variant text-on-surface-variant">
                                    <Icon size={15} strokeWidth={1.75} />
                                </span>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-[13px] font-medium text-on-surface">
                                        {a.name}
                                    </p>
                                    <p className="font-mono text-[10px] uppercase tracking-[0.06em] text-outline">
                                        {meta.label}
                                    </p>
                                </div>
                                <span
                                    className={`shrink-0 font-mono text-[13px] ${
                                        negative ? "text-[#ba1a1a]" : "text-on-surface"
                                    }`}
                                >
                                    {formatCurrency(a.balance, a.currency, { compact: true })}
                                </span>
                            </StaggerItem>
                        );
                    })}
                </StaggerList>
            )}
        </Card>
    );
}
