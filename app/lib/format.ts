/**
 * Pure formatting helpers shared by server and client components.
 * No side effects, no "use client" — safe to import anywhere.
 */

const MINUS = "−"; // proper minus sign for the financial-terminal look

export function formatCurrency(
    amount: number,
    currency = "USD",
    opts?: { sign?: boolean },
): string {
    // Always show the complete amount with thousands grouping — never compact
    // ("K"/"M") notation. Whole values render without decimals (₹29,397); only
    // amounts with a fractional part show paise/cents (₹42.20).
    const fractionDigits = Number.isInteger(amount) ? 0 : 2;
    const nf = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
    });
    // Format the magnitude and apply the sign ourselves so we get a single,
    // typographic minus (Intl would otherwise add its own hyphen-minus).
    const body = nf.format(Math.abs(amount));
    if (opts?.sign) return `${amount < 0 ? MINUS : "+"}${body}`;
    return amount < 0 ? `${MINUS}${body}` : body;
}

/** Accepts a fraction (0.042 → "+4.2%"). Returns an em-dash for null. */
export function formatPct(value: number | null, opts?: { sign?: boolean }): string {
    if (value == null || !Number.isFinite(value)) return "—";
    const pct = value * 100;
    const body = `${Math.abs(pct).toFixed(1)}%`;
    if (opts?.sign) return `${pct < 0 ? MINUS : "+"}${body}`;
    return body;
}

export function formatDate(iso: string): string {
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "2-digit",
    }).format(new Date(iso));
}

export function formatRelative(iso: string): string {
    const then = new Date(iso).getTime();
    const diffMs = Date.now() - then;
    const mins = Math.round(diffMs / 60_000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.round(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.round(hours / 24);
    if (days < 30) return `${days}d ago`;
    return formatDate(iso);
}

/** Clamp a 0..1 ratio to a 0..100 percentage, guarding against NaN/Infinity. */
export function toPercent(ratio: number): number {
    if (!Number.isFinite(ratio)) return 0;
    return Math.min(100, Math.max(0, ratio * 100));
}
