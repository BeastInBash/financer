"use client";

import { motion, useReducedMotion } from "motion/react";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Shimmering placeholder block — a soft highlight sweeps left→right across a
 * `surface-container` rectangle. Honors reduced-motion (renders static).
 * Shared by the route `loading.tsx` skeletons.
 */
export function Shimmer({ className = "", delay = 0 }: { className?: string; delay?: number }) {
    const reduce = useReducedMotion();
    return (
        <span className={`relative block overflow-hidden bg-surface-container ${className}`}>
            {!reduce && (
                <motion.span
                    aria-hidden
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/70 to-transparent"
                    initial={{ x: "-100%" }}
                    animate={{ x: "100%" }}
                    transition={{
                        duration: 1.5,
                        ease: "linear",
                        repeat: Infinity,
                        repeatDelay: 0.4,
                        delay,
                    }}
                />
            )}
        </span>
    );
}

/** Thin accent line with a continuously travelling segment — a loading marquee. */
export function ScanBar() {
    const reduce = useReducedMotion();
    if (reduce) return <div className="h-0.5 w-full bg-accent/30" />;
    return (
        <div className="relative h-0.5 w-full overflow-hidden bg-surface-container">
            <motion.div
                className="absolute inset-y-0 w-1/3 bg-accent"
                initial={{ x: "-100%" }}
                animate={{ x: "300%" }}
                transition={{ duration: 1.3, ease: EASE, repeat: Infinity }}
            />
        </div>
    );
}
