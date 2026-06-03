"use client";

import { NotificationType } from "@/app/generated/prisma/enums";
import { AlertTriangle, BellRing, CheckCircle2, FileText, RefreshCw } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { NotificationRow } from "@/app/lib/dashboard/types";
import { formatRelative } from "@/app/lib/format";
import { Card, CardHeader } from "./card";
import { StaggerItem, StaggerList } from "./motion-primitives";

const NOTIF_META: Record<NotificationType, { icon: LucideIcon; accent: boolean }> = {
    [NotificationType.BUDGET_ALERT]: { icon: AlertTriangle, accent: true },
    [NotificationType.GOAL_COMPLETED]: { icon: CheckCircle2, accent: false },
    [NotificationType.RECURRING_PAYMENT]: { icon: RefreshCw, accent: false },
    [NotificationType.MONTHLY_REPORT]: { icon: FileText, accent: false },
};

export function Notifications({
    unread,
    items,
}: {
    unread: number;
    items: NotificationRow[];
}) {
    return (
        <Card>
            <CardHeader
                title="Alerts"
                action={
                    <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.06em] text-on-surface-variant">
                        <BellRing size={12} strokeWidth={2} />
                        {unread} unread
                    </span>
                }
            />
            {items.length === 0 ? (
                <p className="p-5 font-mono text-[11px] uppercase tracking-[0.06em] text-outline">
                    No alerts
                </p>
            ) : (
                <StaggerList className="divide-y divide-outline-variant">
                    {items.map((n) => {
                        const meta = NOTIF_META[n.type];
                        const Icon = meta.icon;
                        return (
                            <StaggerItem
                                key={n.id}
                                className="flex items-start gap-3 p-4 transition-colors hover:bg-surface-low sm:px-5"
                            >
                                <span
                                    className={`mt-0.5 shrink-0 ${
                                        meta.accent ? "text-accent" : "text-outline"
                                    }`}
                                >
                                    <Icon size={15} strokeWidth={2} />
                                </span>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                        <p className="truncate text-[13px] font-medium text-on-surface">
                                            {n.title}
                                        </p>
                                        {!n.isRead && (
                                            <span
                                                className="size-1.5 shrink-0 bg-accent"
                                                aria-label="unread"
                                            />
                                        )}
                                    </div>
                                    <p className="mt-0.5 text-[12px] leading-snug text-on-surface-variant">
                                        {n.message}
                                    </p>
                                    <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.04em] text-outline">
                                        {formatRelative(n.createdAt)}
                                    </p>
                                </div>
                            </StaggerItem>
                        );
                    })}
                </StaggerList>
            )}
        </Card>
    );
}
