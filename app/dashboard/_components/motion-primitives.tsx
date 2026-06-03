"use client";

import { useEffect, useRef, useState } from "react";
import {
    animate,
    motion,
    useInView,
    useReducedMotion,
    type Variants,
} from "motion/react";
import type { ReactNode } from "react";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Counts up to `value` once it scrolls into view. Honors reduced-motion by
 * snapping straight to the final value. `format` controls the rendered string.
 */
export function AnimatedNumber({
    value,
    format,
    className,
    duration = 1.1,
}: {
    value: number;
    format?: (v: number) => string;
    className?: string;
    duration?: number;
}) {
    const ref = useRef<HTMLSpanElement>(null);
    const inView = useInView(ref, { once: true, margin: "-12%" });
    const reduce = useReducedMotion();
    const [display, setDisplay] = useState(0);

    useEffect(() => {
        if (!inView || reduce) return;
        const controls = animate(0, value, {
            duration,
            ease: EASE,
            onUpdate: (v) => setDisplay(v),
        });
        return () => controls.stop();
    }, [inView, value, reduce, duration]);

    // Reduced motion (or pre-animation, off-screen) renders the resolved value
    // without ever calling setState synchronously inside the effect.
    const shown = reduce ? value : display;

    return (
        <span ref={ref} className={className}>
            {format ? format(shown) : Math.round(shown).toLocaleString()}
        </span>
    );
}

/** Fades + lifts children into view a single time. */
export function Reveal({
    children,
    delay = 0,
    className,
}: {
    children: ReactNode;
    delay?: number;
    className?: string;
}) {
    const reduce = useReducedMotion();
    return (
        <motion.div
            className={className}
            initial={reduce ? false : { opacity: 0, y: 14 }}
            whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-8%" }}
            transition={{ duration: 0.5, delay, ease: EASE }}
        >
            {children}
        </motion.div>
    );
}

/** Container that staggers its direct `Stagger.Item` children on view. */
const listVariants: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
};

export function StaggerList({
    children,
    className,
}: {
    children: ReactNode;
    className?: string;
}) {
    const reduce = useReducedMotion();
    return (
        <motion.div
            className={className}
            variants={reduce ? undefined : listVariants}
            initial={reduce ? false : "hidden"}
            whileInView={reduce ? undefined : "show"}
            viewport={{ once: true, margin: "-6%" }}
        >
            {children}
        </motion.div>
    );
}

export function StaggerItem({
    children,
    className,
}: {
    children: ReactNode;
    className?: string;
}) {
    const reduce = useReducedMotion();
    return (
        <motion.div className={className} variants={reduce ? undefined : itemVariants}>
            {children}
        </motion.div>
    );
}

/** Animated horizontal progress meter (0..1, clamps display at 100%). */
export function ProgressBar({
    value,
    tone = "ink",
    className = "h-1.5",
}: {
    value: number;
    tone?: "ink" | "accent" | "error";
    className?: string;
}) {
    const reduce = useReducedMotion();
    const width = `${Math.min(100, Math.max(0, value * 100))}%`;
    const bg =
        tone === "accent" ? "bg-accent" : tone === "error" ? "bg-[#ba1a1a]" : "bg-ink";
    return (
        <div className={`w-full overflow-hidden bg-surface-container ${className}`}>
            <motion.div
                className={`h-full ${bg}`}
                initial={reduce ? false : { width: 0 }}
                whileInView={reduce ? undefined : { width }}
                style={reduce ? { width } : undefined}
                viewport={{ once: true, margin: "-6%" }}
                transition={{ duration: 0.9, ease: EASE }}
            />
        </div>
    );
}
