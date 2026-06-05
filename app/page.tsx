"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Show, UserButton, useSession } from "@clerk/nextjs";
import {
    motion,
    useInView,
    useMotionValue,
    useReducedMotion,
    animate,
    type Variants,
} from "motion/react";
import {
    LineChart,
    Bot,
    ShieldAlert,
    FileText,
    ArrowRight,
    LayoutGrid,
    type LucideIcon,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Motion primitives                                                  */
/* ------------------------------------------------------------------ */

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.09, delayChildren: 0.08 } },
};

function useFadeUp(): Variants {
    const reduce = useReducedMotion();
    return {
        hidden: { opacity: 0, y: reduce ? 0 : 18 },
        show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
    };
}

function Reveal({
    children,
    delay = 0,
    className,
}: {
    children: React.ReactNode;
    delay?: number;
    className?: string;
}) {
    const reduce = useReducedMotion();
    return (
        <motion.div
            className={className}
            initial={{ opacity: 0, y: reduce ? 0 : 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: EASE, delay }}
        >
            {children}
        </motion.div>
    );
}

/** Animated number that counts up once it scrolls into view. */
function CountUp({
    to,
    decimals = 0,
    prefix = "",
    suffix = "",
}: {
    to: number;
    decimals?: number;
    prefix?: string;
    suffix?: string;
}) {
    const ref = useRef<HTMLSpanElement>(null);
    const inView = useInView(ref, { once: true, margin: "-60px" });
    const reduce = useReducedMotion();
    const mv = useMotionValue(0);
    const [text, setText] = useState(() => to.toFixed(decimals));

    useEffect(() => {
        const format = (v: number) =>
            v.toLocaleString("en-US", {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals,
            });

        if (!inView) {
            setText(format(0));
            return;
        }
        if (reduce) {
            setText(format(to));
            return;
        }
        const controls = animate(mv, to, { duration: 1.4, ease: EASE });
        const unsub = mv.on("change", (v) => setText(format(v)));
        return () => {
            controls.stop();
            unsub();
        };
    }, [inView, reduce, to, decimals, mv]);

    return (
        <span ref={ref}>
            {prefix}
            {text}
            {suffix}
        </span>
    );
}

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const NAV_LINKS = ["Platform", "Analytics", "Security", "Pricing"];

const STATS: {
    value: number;
    decimals?: number;
    prefix?: string;
    suffix?: string;
    label: string;
}[] = [
        { value: 2.4, decimals: 1, prefix: "$", suffix: "B", label: "Assets monitored" },
        { value: 99.99, decimals: 2, suffix: "%", label: "Uptime SLA" },
        { value: 0.4, decimals: 1, suffix: "ms", label: "Median latency" },
        { value: 40, suffix: "+", label: "Data integrations" },
    ];

const FEATURES: { icon: LucideIcon; title: string; body: string; tag: string }[] = [
    {
        icon: LineChart,
        title: "Real-time analytics",
        body: "Live portfolio, cash-flow, and exposure metrics rendered the instant data lands — no overnight batch.",
        tag: "01 / LIVE",
    },
    {
        icon: Bot,
        title: "AI Advisor",
        body: "Context-aware guidance that reads your books and surfaces the next best action with cited reasoning.",
        tag: "02 / INTELLIGENCE",
    },
    {
        icon: ShieldAlert,
        title: "Risk detection",
        body: "Anomaly and threshold monitoring that flags drift early — before variance compounds into loss.",
        tag: "03 / DEFENSE",
    },
    {
        icon: FileText,
        title: "Institutional reporting",
        body: "Audit-ready statements and exports, generated on a strict baseline grid for tabular precision.",
        tag: "04 / RECORD",
    },
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function Landing() {
    const fadeUp = useFadeUp();
    const { isLoaded, session } = useSession()
    return (
        <div className="min-h-screen bg-surface font-sans text-on-surface">
            <Header />

            <main>
                {/* ---------------- Hero ---------------- */}
                <section className="relative overflow-hidden border-b border-outline-variant">
                    {/* blueprint grid backdrop */}
                    <div
                        aria-hidden
                        className="pointer-events-none absolute inset-0"
                        style={{
                            backgroundImage:
                                "linear-gradient(to right, rgba(116,120,120,0.10) 1px, transparent 1px), linear-gradient(to bottom, rgba(116,120,120,0.10) 1px, transparent 1px)",
                            backgroundSize: "64px 64px",
                            maskImage:
                                "radial-gradient(120% 100% at 0% 0%, black 30%, transparent 75%)",
                        }}
                    />

                    <div className="relative mx-auto grid max-w-[1280px] grid-cols-1 gap-10 px-4 py-16 sm:gap-12 sm:px-6 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8 lg:px-8 lg:py-28">
                        {/* copy */}
                        <motion.div variants={container} initial="hidden" animate="show">
                            <motion.div variants={fadeUp}>
                                <Eyebrow>Finance Manager</Eyebrow>
                            </motion.div>

                            <motion.h1
                                variants={fadeUp}
                                className="mt-6 max-w-[15ch] text-4xl font-bold leading-[1.05] tracking-[-0.02em] text-on-surface sm:text-5xl lg:text-[56px]"
                            >
                                Capital clarity, at{" "}
                                <span className="text-accent">terminal speed.</span>
                            </motion.h1>

                            <motion.p
                                variants={fadeUp}
                                className="mt-6 max-w-[52ch] text-[15px] leading-relaxed text-on-surface-variant"
                            >
                                FINANCER unifies analytics, AI advisory, and risk detection into a
                                single high-density workspace — so your team decides with conviction,
                                not guesswork.
                            </motion.p>

                            <motion.div
                                variants={fadeUp}
                                className="mt-9 flex flex-wrap items-center gap-3"
                            >
                                <Link
                                    href={session?.id ? "/dashboard" :"/sign-in"}
                                    className="group inline-flex h-12 items-center gap-2 bg-ink px-6 font-mono text-[12px] font-medium uppercase tracking-[0.08em] text-white transition-colors hover:bg-accent"
                                >
                                    Get started
                                    <ArrowRight
                                        size={16}
                                        className="transition-transform group-hover:translate-x-1"
                                    />
                                </Link>
                                <Link
                                    href="/dashboard"
                                    className="inline-flex h-12 items-center px-6 font-mono text-[12px] font-medium uppercase tracking-[0.08em] text-on-surface ring-1 ring-inset ring-outline-variant transition-colors hover:ring-ink"
                                >
                                    Explore the platform
                                </Link>
                            </motion.div>

                            <motion.div
                                variants={fadeUp}
                                className="mt-10 flex items-center gap-3 border-t border-outline-variant pt-5 font-mono text-[11px] uppercase tracking-[0.08em] text-outline"
                            >
                                <PulseSquare />
                                System status — Operational · Latency 0.4ms · Uptime 99.99%
                            </motion.div>
                        </motion.div>

                        {/* terminal panel */}
                        <HeroPanel />
                    </div>
                </section>

                {/* ---------------- Stats ---------------- */}
                <section className="border-b border-outline-variant">
                    <div className="mx-auto grid max-w-[1280px] grid-cols-2 lg:grid-cols-4">
                        {STATS.map((s, i) => (
                            <Reveal
                                key={s.label}
                                delay={i * 0.08}
                                className={[
                                    "border-outline-variant px-4 py-8 sm:px-6 lg:px-8",
                                    i % 2 === 1 ? "border-l" : "",
                                    i >= 2 ? "border-t lg:border-t-0" : "",
                                    i % 4 !== 0 ? "lg:border-l" : "",
                                ].join(" ")}
                            >
                                <div className="font-mono text-3xl font-medium tracking-[-0.01em] text-on-surface lg:text-4xl">
                                    <CountUp
                                        to={s.value}
                                        decimals={s.decimals}
                                        prefix={s.prefix}
                                        suffix={s.suffix}
                                    />
                                </div>
                                <div className="mt-2 font-mono text-[11px] uppercase tracking-[0.08em] text-outline">
                                    {s.label}
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </section>

                {/* ---------------- Features ---------------- */}
                <section className="mx-auto max-w-[1280px] px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
                    <Reveal>
                        <Eyebrow>Built for high-stakes decisions</Eyebrow>
                        <h2 className="mt-5 max-w-[20ch] text-3xl font-bold tracking-[-0.02em] lg:text-[40px]">
                            One workspace, the entire financial picture.
                        </h2>
                    </Reveal>

                    <div className="mt-14 grid grid-cols-1 border-l border-t border-outline-variant sm:grid-cols-2 lg:grid-cols-4">
                        {FEATURES.map((f, i) => (
                            <FeatureCard key={f.title} {...f} delay={i * 0.07} />
                        ))}
                    </div>
                </section>

                {/* ---------------- CTA band ---------------- */}
                <section className="border-y border-outline-variant bg-ink">
                    <div className="mx-auto flex max-w-[1280px] flex-col items-start gap-8 px-4 py-16 sm:px-6 sm:py-20 lg:flex-row lg:items-center lg:justify-between lg:px-8">
                        <Reveal>
                            <Eyebrow tone="dark">Ready when you are</Eyebrow>
                            <h2 className="mt-5 max-w-[18ch] text-3xl font-bold tracking-[-0.02em] text-white lg:text-[40px]">
                                Bring your capital into focus.
                            </h2>
                        </Reveal>
                        <Reveal delay={0.1}>
                            <Link
                                href="/sign-in"
                                className="group inline-flex h-12 items-center gap-2 bg-white px-7 font-mono text-[12px] font-medium uppercase tracking-[0.08em] text-ink transition-colors hover:bg-accent hover:text-white"
                            >
                                Get started
                                <ArrowRight
                                    size={16}
                                    className="transition-transform group-hover:translate-x-1"
                                />
                            </Link>
                        </Reveal>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Pieces                                                             */
/* ------------------------------------------------------------------ */

function Header() {
    const reduce = useReducedMotion();
    return (
        <motion.header
            initial={{ opacity: 0, y: reduce ? 0 : -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="sticky top-0 z-50 border-b border-outline-variant bg-surface/80 backdrop-blur-sm"
        >
            <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-4 sm:px-6 lg:px-8">
                <Link href="/" className="flex items-baseline gap-2">
                    <span className="font-sans text-lg font-bold tracking-tight text-on-surface">
                        FINANCER
                    </span>
                    <span className="hidden font-mono text-[10px] uppercase tracking-[0.08em] text-outline sm:inline">
                       Finance Manager 
                    </span>
                </Link>

                <nav className="hidden items-center gap-8 md:flex">
                    {NAV_LINKS.map((l) => (
                        <a
                            key={l}
                            href="#"
                            className="font-mono text-[12px] uppercase tracking-[0.06em] text-on-surface-variant transition-colors hover:text-on-surface"
                        >
                            {l}
                        </a>
                    ))}
                </nav>

                <div className="flex items-center gap-2">
                    <Show
                        when="signed-in"
                        fallback={
                            <>
                                <Link
                                    href="/sign-in"
                                    className="hidden h-10 items-center px-4 font-mono text-[12px] font-medium uppercase tracking-[0.08em] text-on-surface transition-colors hover:text-accent sm:inline-flex"
                                >
                                    Sign in
                                </Link>
                                <Link
                                    href="/sign-in"
                                    className="inline-flex h-10 items-center bg-ink px-4 font-mono text-[12px] font-medium uppercase tracking-[0.08em] text-white transition-colors hover:bg-accent"
                                >
                                    Get started
                                </Link>
                            </>
                        }
                    >
                        <Link
                            href="/dashboard"
                            className="inline-flex h-10 items-center gap-2 bg-ink px-4 font-mono text-[12px] font-medium uppercase tracking-[0.08em] text-white transition-colors hover:bg-accent"
                        >
                            <LayoutGrid size={15} strokeWidth={2} />
                            Dashboard
                        </Link>
                        <UserButton
                            appearance={{ elements: { avatarBox: "h-9 w-9 rounded-none" } }}
                        />
                    </Show>
                </div>
            </div>
        </motion.header>
    );
}

function Eyebrow({
    children,
    tone = "light",
}: {
    children: React.ReactNode;
    tone?: "light" | "dark";
}) {
    return (
        <span
            className={[
                "inline-flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.12em]",
                tone === "dark" ? "text-white/60" : "text-outline",
            ].join(" ")}
        >
            <span className="size-1.5 bg-accent" />
            {children}
        </span>
    );
}

function PulseSquare() {
    const reduce = useReducedMotion();
    return (
        <motion.span
            aria-hidden
            className="size-2 shrink-0 bg-accent"
            animate={reduce ? undefined : { opacity: [1, 0.25, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        />
    );
}

function FeatureCard({
    icon: Icon,
    title,
    body,
    tag,
    delay,
}: {
    icon: LucideIcon;
    title: string;
    body: string;
    tag: string;
    delay: number;
}) {
    const reduce = useReducedMotion();
    return (
        <motion.div
            initial={{ opacity: 0, y: reduce ? 0 : 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease: EASE, delay }}
            className="group relative border-b border-r border-outline-variant p-7 transition-colors hover:bg-surface-low"
        >
            {/* accent rail on hover */}
            <span className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-accent transition-transform duration-300 group-hover:scale-x-100" />
            <div className="flex items-center justify-between">
                <Icon size={22} strokeWidth={1.75} className="text-on-surface" />
                <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-outline">
                    {tag}
                </span>
            </div>
            <h3 className="mt-6 text-lg font-semibold tracking-[-0.01em] text-on-surface">
                {title}
            </h3>
            <p className="mt-2 text-[13px] leading-relaxed text-on-surface-variant">{body}</p>
        </motion.div>
    );
}

function Footer() {
    const cols: { title: string; items: string[] }[] = [
        { title: "Product", items: ["Platform", "Analytics", "AI Advisor", "Pricing"] },
        { title: "Company", items: ["About", "Careers", "Customers", "Contact"] },
        { title: "Resources", items: ["Docs", "API", "Status", "Changelog"] },
        { title: "Legal", items: ["Privacy", "Terms", "Security", "Compliance"] },
    ];
    return (
        <footer className="bg-surface">
            <div className="mx-auto grid max-w-[1280px] grid-cols-2 gap-8 px-4 py-16 sm:grid-cols-3 sm:px-6 lg:grid-cols-5 lg:px-8">
                <div className="col-span-2 sm:col-span-3 lg:col-span-1">
                    <span className="font-sans text-lg font-bold tracking-tight text-on-surface">
                        FINANCER
                    </span>
                    <p className="mt-3 max-w-[28ch] text-[12px] leading-relaxed text-on-surface-variant">
                        The operating system for institutional finance.
                    </p>
                </div>
                {cols.map((c) => (
                    <div key={c.title}>
                        <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-outline">
                            {c.title}
                        </div>
                        <ul className="mt-4 space-y-2.5">
                            {c.items.map((it) => (
                                <li key={it}>
                                    <a
                                        href="#"
                                        className="text-[13px] text-on-surface-variant transition-colors hover:text-on-surface"
                                    >
                                        {it}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
            <div className="border-t border-outline-variant">
                <div className="mx-auto flex max-w-[1280px] flex-col items-start justify-between gap-3 px-4 py-6 font-mono text-[11px] uppercase tracking-[0.08em] text-outline sm:flex-row sm:items-center sm:px-6 lg:px-8">
                    <span>© 2026 Financer — All rights reserved</span>
                    <span className="flex items-center gap-2">
                        <span className="size-2 bg-accent" />
                        All systems operational
                    </span>
                </div>
            </div>
        </footer>
    );
}

/* ------------------------------------------------------------------ */
/*  Hero terminal panel                                                */
/* ------------------------------------------------------------------ */

const BARS = [42, 58, 35, 71, 64, 88, 52, 96, 78];

function HeroPanel() {
    const reduce = useReducedMotion();
    const rows = [
        { k: "Net liquidity", v: "$1,204,880", up: true },
        { k: "Burn rate", v: "$96,200 / mo", up: false },
        { k: "Runway", v: "18.4 months", up: true },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: reduce ? 0 : 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.2 }}
            className="relative w-full self-center border border-ink"
            style={{ backgroundColor: "#ffffff" }}
        >
            {/* title bar */}
            <div className="flex items-center justify-between border-b border-outline-variant px-4 py-3">
                <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.08em] text-on-surface">
                    <PulseSquare />
                    Intelligence Feed — Live
                </span>
                <span className="font-mono text-[11px] tracking-[0.04em] text-outline">14:32:07</span>
            </div>

            {/* highlighted metric */}
            <div className="flex items-end justify-between border-b border-outline-variant px-4 py-5">
                <div>
                    <div className="font-mono text-[10px] uppercase tracking-[0.08em] text-outline">
                        Portfolio change · 24h
                    </div>
                    <div className="mt-1 font-mono text-3xl font-medium tracking-[-0.01em] text-accent">
                        +4.2%
                    </div>
                </div>
                {/* mini bar chart */}
                <div className="flex h-16 items-end gap-1.5">
                    {BARS.map((h, i) => (
                        <motion.span
                            key={i}
                            className="w-2"
                            style={{
                                backgroundColor: i === BARS.length - 2 ? "#ea580c" : "#dbdad9",
                            }}
                            initial={{ height: reduce ? `${h}%` : 0 }}
                            animate={{ height: `${h}%` }}
                            transition={{ duration: 0.7, ease: EASE, delay: 0.5 + i * 0.05 }}
                        />
                    ))}
                </div>
            </div>

            {/* data rows */}
            <div className="divide-y divide-outline-variant">
                {rows.map((r) => (
                    <div key={r.k} className="flex items-center justify-between px-4 py-3">
                        <span className="font-mono text-[12px] text-on-surface-variant">{r.k}</span>
                        <span className="flex items-center gap-2 font-mono text-[13px] text-on-surface">
                            {r.v}
                            <span
                                aria-hidden
                                style={{
                                    width: 0,
                                    height: 0,
                                    borderLeft: "4px solid transparent",
                                    borderRight: "4px solid transparent",
                                    ...(r.up
                                        ? { borderBottom: "6px solid #ea580c" }
                                        : { borderTop: "6px solid #747878" }),
                                }}
                            />
                        </span>
                    </div>
                ))}
            </div>
        </motion.div>
    );
}
