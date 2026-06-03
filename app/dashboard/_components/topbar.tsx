"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { Bell, Plus, Search } from "lucide-react";

const MotionLink = motion.create(Link);

const TABS = ["Overview", "Liquidity", "Risk"] as const;

export function Topbar({
    title,
    unread,
}: {
    title: string;
    unread: number;
}) {
    const reduce = useReducedMotion();
    const [tab, setTab] = useState<(typeof TABS)[number]>("Overview");

    return (
        <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-3 border-b border-outline-variant bg-surface/90 px-4 backdrop-blur-sm lg:px-6">
            <div className="hidden min-w-0 flex-col md:flex">
                <span className="truncate font-mono text-[10px] uppercase tracking-[0.08em] text-outline">
                    Welcome back
                </span>
                <span className="truncate font-sans text-[15px] font-semibold leading-tight text-on-surface">
                    {title}
                </span>
            </div>

            <label className="ml-auto flex h-10 w-full max-w-xs items-center gap-2 bg-surface-low px-3 font-mono text-[12px] text-outline transition-shadow focus-within:ring-1 focus-within:ring-accent md:ml-4 md:mr-auto">
                <Search size={15} strokeWidth={2} className="shrink-0" />
                <input
                    placeholder="QUERY LEDGER…"
                    className="w-full bg-transparent uppercase tracking-[0.06em] text-on-surface placeholder:text-outline focus:outline-none"
                />
            </label>

            <nav className="hidden items-center gap-5 lg:flex">
                {TABS.map((t) => {
                    const on = t === tab;
                    return (
                        <button
                            key={t}
                            type="button"
                            onClick={() => setTab(t)}
                            className={`relative pb-1 font-mono text-[12px] uppercase tracking-[0.06em] transition-colors ${
                                on ? "text-on-surface" : "text-on-surface-variant hover:text-on-surface"
                            }`}
                        >
                            {t}
                            {on && (
                                <motion.span
                                    layoutId="topbar-tab"
                                    className="absolute -bottom-px left-0 h-0.5 w-full bg-accent"
                                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                                />
                            )}
                        </button>
                    );
                })}
            </nav>

            <div className="flex items-center gap-3">
                <MotionLink
                    href="/entry/new"
                    whileHover={reduce ? undefined : { y: -2 }}
                    whileTap={reduce ? undefined : { y: 0, scale: 0.98 }}
                    className="inline-flex h-10 items-center gap-2 bg-ink px-3 font-mono text-[12px] font-medium uppercase tracking-[0.08em] text-white transition-colors hover:bg-accent sm:px-4"
                >
                    <Plus size={15} strokeWidth={2.25} />
                    <span className="hidden sm:inline">Add Entry</span>
                </MotionLink>
                <button
                    type="button"
                    aria-label={`Notifications, ${unread} unread`}
                    className="relative grid size-10 place-items-center border border-outline-variant text-on-surface-variant transition-colors hover:border-ink hover:text-on-surface"
                >
                    <Bell size={17} strokeWidth={1.75} />
                    {unread > 0 && (
                        <span className="absolute -right-1.5 -top-1.5 grid size-4 place-items-center bg-accent font-mono text-[9px] font-bold text-on-accent">
                            {unread > 9 ? "9+" : unread}
                        </span>
                    )}
                </button>
            </div>
        </header>
    );
}
