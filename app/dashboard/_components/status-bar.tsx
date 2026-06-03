"use client";

import { useEffect, useState } from "react";

export function StatusBar({ isSample }: { isSample: boolean }) {
    const [clock, setClock] = useState<string>("");

    useEffect(() => {
        const tick = () =>
            setClock(
                new Intl.DateTimeFormat("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: false,
                }).format(new Date()),
            );
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, []);

    return (
        <footer className="sticky bottom-0 z-10 flex items-center justify-between gap-4 border-t border-outline-variant bg-surface px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.08em] text-outline lg:px-6">
            <span className="flex items-center gap-2">
                <span className="size-2 animate-pulse bg-accent" />
                {isSample ? "Demo Dataset" : "Live · Operational"}
            </span>
            <span className="hidden gap-5 sm:flex">
                <span>Latency: 14ms</span>
                <span suppressHydrationWarning>Clock: {clock || "--:--:--"}</span>
                <span className="hidden md:inline">Secure_Node: TLS_1.3</span>
            </span>
        </footer>
    );
}
