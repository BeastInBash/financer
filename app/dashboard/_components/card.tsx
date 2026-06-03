import type { ReactNode } from "react";

/**
 * Brutalist card shell: 1px border, 0px radius, no shadow. Header is divided
 * from the body by a single hairline rule. Importable from server or client.
 */
export function Card({
    children,
    className = "",
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <div className={`flex flex-col border border-outline-variant bg-background ${className}`}>
            {children}
        </div>
    );
}

export function CardHeader({
    title,
    action,
}: {
    title: string;
    action?: ReactNode;
}) {
    return (
        <div className="flex h-12 shrink-0 items-center justify-between gap-2 border-b border-outline-variant px-4 sm:px-5">
            <h2 className="font-mono text-[12px] font-medium uppercase tracking-[0.08em] text-on-surface">
                {title}
            </h2>
            {action}
        </div>
    );
}

export function Label({ children }: { children: ReactNode }) {
    return (
        <span className="font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-outline">
            {children}
        </span>
    );
}
