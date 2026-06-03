"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
    ArrowDownLeft,
    ArrowLeft,
    ArrowLeftRight,
    ArrowUpRight,
    Check,
    ChevronDown,
    X,
    type LucideIcon,
} from "lucide-react";
import { TransactionType } from "@/app/generated/prisma/enums";
import { Card, CardHeader } from "@/app/dashboard/_components/card";
import { Reveal } from "@/app/dashboard/_components/motion-primitives";
import { ReceiptUpload } from "./receipt-upload";

const EASE = [0.16, 1, 0.3, 1] as const;

export interface SelectOption {
    id: string;
    name: string;
}

export interface Props {
    accounts: SelectOption[];
    categories: SelectOption[];
    currency: string;
}

/** Mirrors the `Transaction` model in schema.prisma (plus a transfer destination). */
export interface NewEntryPayload {
    type: TransactionType;
    title: string;
    amount: number;
    accountId: string;
    /** Only set for TRANSFER entries; null otherwise. */
    toAccountId: string | null;
    categoryId: string | null;
    transactionDate: string; // ISO 8601
    notes: string | null;
    /** The raw upload (image/PDF). A real API would receive this via multipart. */
    receipt: File | null;
    tags: string[];
}

type FieldKey = "title" | "amount" | "accountId" | "toAccountId" | "transactionDate";
type Errors = Partial<Record<FieldKey, string>>;

const TYPE_OPTIONS: { key: TransactionType; label: string; icon: LucideIcon }[] = [
    { key: TransactionType.INCOME, label: "Income", icon: ArrowDownLeft },
    { key: TransactionType.EXPENSE, label: "Expense", icon: ArrowUpRight },
    { key: TransactionType.TRANSFER, label: "Transfer", icon: ArrowLeftRight },
];

function todayISO(): string {
    return new Date().toISOString().slice(0, 10);
}

export function NewEntryForm({ accounts, categories, currency }: Props) {
    const reduce = useReducedMotion();

    const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
    const [title, setTitle] = useState("");
    const [amount, setAmount] = useState("");
    const [accountId, setAccountId] = useState("");
    const [toAccountId, setToAccountId] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [date, setDate] = useState(todayISO());
    const [notes, setNotes] = useState("");
    const [tags, setTags] = useState("");
    const [receipt, setReceipt] = useState<File | null>(null);
    const [errors, setErrors] = useState<Errors>({});
    const [submitted, setSubmitted] = useState<NewEntryPayload | null>(null);

    const isTransfer = type === TransactionType.TRANSFER;

    function clearError(key: FieldKey) {
        setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
    }

    function validate(): Errors {
        const next: Errors = {};
        if (!title.trim()) next.title = "Title is required";
        const amt = Number(amount);
        if (!amount.trim() || !Number.isFinite(amt) || amt <= 0) {
            next.amount = "Enter an amount greater than 0";
        }
        if (!accountId) next.accountId = "Select an account";
        if (isTransfer) {
            if (!toAccountId) next.toAccountId = "Select a destination account";
            else if (toAccountId === accountId) next.toAccountId = "Must differ from source";
        }
        if (!date) next.transactionDate = "Pick a date";
        return next;
    }

    function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const found = validate();
        setErrors(found);
        if (Object.keys(found).length > 0) return;

        const payload: NewEntryPayload = {
            type,
            title: title.trim(),
            amount: Number(amount),
            accountId,
            toAccountId: isTransfer ? toAccountId : null,
            categoryId: isTransfer ? null : categoryId || null,
            transactionDate: new Date(date).toISOString(),
            notes: notes.trim() || null,
            receipt,
            tags: tags
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean),
        };

        // No API yet — surface the exact shape an endpoint would receive.
        console.log("[new-entry] submit payload →", payload);
        setSubmitted(payload);

        // Reset the per-entry fields, keep type/account/date for fast repeat entry.
        setTitle("");
        setAmount("");
        setNotes("");
        setTags("");
        setReceipt(null);
        setCategoryId("");
        setErrors({});
    }

    const amountTone = isTransfer
        ? "text-on-surface"
        : type === TransactionType.INCOME
          ? "text-accent"
          : "text-on-surface";

    return (
        <div className="flex min-h-screen flex-col">
            {/* Header */}
            <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-3 border-b border-outline-variant bg-surface/90 px-4 backdrop-blur-sm lg:px-6">
                <Link
                    href="/dashboard"
                    className="grid size-10 place-items-center border border-outline-variant text-on-surface-variant transition-colors hover:border-ink hover:text-on-surface"
                    aria-label="Back to dashboard"
                >
                    <ArrowLeft size={17} strokeWidth={1.75} />
                </Link>
                <div className="min-w-0">
                    <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-outline">
                        Ledger
                    </p>
                    <h1 className="truncate font-sans text-[15px] font-semibold leading-tight text-on-surface">
                        New Entry
                    </h1>
                </div>
            </header>

            <div className="mx-auto w-full max-w-3xl flex-1 p-4 lg:p-6">
                <AnimatePresence>
                    {submitted && (
                        <SuccessBanner
                            payload={submitted}
                            reduce={!!reduce}
                            onDismiss={() => setSubmitted(null)}
                        />
                    )}
                </AnimatePresence>

                <Reveal>
                    <Card>
                        <CardHeader title="Transaction Detail" />
                        <form onSubmit={handleSubmit} noValidate className="space-y-6 p-4 sm:p-6">
                            {/* Type selector */}
                            <div>
                                <FieldLabel>Type</FieldLabel>
                                <div className="mt-1.5 grid grid-cols-3 border border-outline-variant">
                                    {TYPE_OPTIONS.map((opt) => {
                                        const on = opt.key === type;
                                        const Icon = opt.icon;
                                        return (
                                            <button
                                                key={opt.key}
                                                type="button"
                                                onClick={() => setType(opt.key)}
                                                aria-pressed={on}
                                                className={`relative flex h-11 items-center justify-center gap-2 font-mono text-[12px] uppercase tracking-[0.06em] transition-colors ${
                                                    on
                                                        ? "text-on-accent"
                                                        : "text-on-surface-variant hover:text-on-surface"
                                                }`}
                                            >
                                                {on && (
                                                    <motion.span
                                                        layoutId="entry-type"
                                                        className="absolute inset-0 bg-accent"
                                                        transition={{ duration: 0.3, ease: EASE }}
                                                    />
                                                )}
                                                <span className="relative z-10 flex items-center gap-2">
                                                    <Icon size={14} strokeWidth={2} />
                                                    {opt.label}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Amount */}
                            <Field label="Amount" htmlFor="amount" error={errors.amount}>
                                <div
                                    className={`flex h-14 items-stretch border bg-background focus-within:ring-1 focus-within:ring-accent ${
                                        errors.amount ? "border-[#ba1a1a]" : "border-outline-variant"
                                    }`}
                                >
                                    <span className="grid w-16 place-items-center border-r border-outline-variant font-mono text-[12px] uppercase tracking-[0.06em] text-outline">
                                        {currency}
                                    </span>
                                    <input
                                        id="amount"
                                        inputMode="decimal"
                                        placeholder="0.00"
                                        value={amount}
                                        onChange={(e) => {
                                            setAmount(e.target.value);
                                            clearError("amount");
                                        }}
                                        className={`w-full bg-transparent px-4 font-mono text-2xl tracking-[-0.01em] placeholder:text-outline focus:outline-none ${amountTone}`}
                                    />
                                </div>
                            </Field>

                            {/* Title */}
                            <Field label="Title" htmlFor="title" error={errors.title}>
                                <TextInput
                                    id="title"
                                    placeholder="e.g. Stripe Payout"
                                    value={title}
                                    invalid={!!errors.title}
                                    onChange={(v) => {
                                        setTitle(v);
                                        clearError("title");
                                    }}
                                />
                            </Field>

                            {/* Account + dynamic (category / destination) */}
                            <div className="grid gap-6 sm:grid-cols-2">
                                <Field
                                    label={isTransfer ? "From Account" : "Account"}
                                    htmlFor="account"
                                    error={errors.accountId}
                                >
                                    <SelectInput
                                        id="account"
                                        value={accountId}
                                        invalid={!!errors.accountId}
                                        placeholder="Select account"
                                        options={accounts}
                                        onChange={(v) => {
                                            setAccountId(v);
                                            clearError("accountId");
                                        }}
                                    />
                                </Field>

                                <AnimatePresence mode="wait" initial={false}>
                                    {isTransfer ? (
                                        <SlotMotion key="to" reduce={!!reduce}>
                                            <Field
                                                label="To Account"
                                                htmlFor="to-account"
                                                error={errors.toAccountId}
                                            >
                                                <SelectInput
                                                    id="to-account"
                                                    value={toAccountId}
                                                    invalid={!!errors.toAccountId}
                                                    placeholder="Select destination"
                                                    options={accounts.filter((a) => a.id !== accountId)}
                                                    onChange={(v) => {
                                                        setToAccountId(v);
                                                        clearError("toAccountId");
                                                    }}
                                                />
                                            </Field>
                                        </SlotMotion>
                                    ) : (
                                        <SlotMotion key="cat" reduce={!!reduce}>
                                            <Field label="Category" htmlFor="category" optional>
                                                <SelectInput
                                                    id="category"
                                                    value={categoryId}
                                                    placeholder="Uncategorized"
                                                    options={categories}
                                                    onChange={setCategoryId}
                                                />
                                            </Field>
                                        </SlotMotion>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Date + Tags */}
                            <div className="grid gap-6 sm:grid-cols-2">
                                <Field label="Date" htmlFor="date" error={errors.transactionDate}>
                                    <input
                                        id="date"
                                        type="date"
                                        value={date}
                                        onChange={(e) => {
                                            setDate(e.target.value);
                                            clearError("transactionDate");
                                        }}
                                        className={`h-11 w-full border bg-background px-3 font-mono text-[13px] text-on-surface focus:outline-none focus:ring-1 focus:ring-accent ${
                                            errors.transactionDate
                                                ? "border-[#ba1a1a]"
                                                : "border-outline-variant"
                                        }`}
                                    />
                                </Field>
                                <Field label="Tags" htmlFor="tags" optional hint="comma separated">
                                    <TextInput
                                        id="tags"
                                        placeholder="infra, recurring"
                                        value={tags}
                                        onChange={setTags}
                                    />
                                </Field>
                            </div>

                            {/* Notes */}
                            <Field label="Notes" htmlFor="notes" optional>
                                <textarea
                                    id="notes"
                                    rows={3}
                                    placeholder="Optional context for this entry…"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className="w-full resize-none border border-outline-variant bg-background px-3 py-2.5 font-sans text-[14px] text-on-surface placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-accent"
                                />
                            </Field>

                            {/* Receipt upload */}
                            <Field label="Receipt" optional hint="image or PDF">
                                <ReceiptUpload value={receipt} onChange={setReceipt} />
                            </Field>

                            {/* Footer */}
                            <div className="flex flex-col-reverse items-stretch gap-3 border-t border-outline-variant pt-5 sm:flex-row sm:items-center sm:justify-between">
                                <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-outline">
                                    Demo · logs to console, no network call
                                </span>
                                <div className="flex items-center gap-3">
                                    <Link
                                        href="/dashboard"
                                        className="grid h-11 flex-1 place-items-center border border-outline-variant px-5 font-mono text-[12px] uppercase tracking-[0.08em] text-on-surface-variant transition-colors hover:border-ink hover:text-on-surface sm:flex-none"
                                    >
                                        Cancel
                                    </Link>
                                    <motion.button
                                        type="submit"
                                        whileHover={reduce ? undefined : { y: -2 }}
                                        whileTap={reduce ? undefined : { scale: 0.98, y: 0 }}
                                        className="inline-flex h-11 flex-1 items-center justify-center gap-2 bg-ink px-6 font-mono text-[12px] font-medium uppercase tracking-[0.08em] text-white transition-colors hover:bg-accent sm:flex-none"
                                    >
                                        <Check size={15} strokeWidth={2.5} />
                                        Save Entry
                                    </motion.button>
                                </div>
                            </div>
                        </form>
                    </Card>
                </Reveal>
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Field primitives                                                   */
/* ------------------------------------------------------------------ */

function FieldLabel({ children, htmlFor }: { children: ReactNode; htmlFor?: string }) {
    return (
        <label
            htmlFor={htmlFor}
            className="font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-outline"
        >
            {children}
        </label>
    );
}

function Field({
    label,
    htmlFor,
    error,
    optional,
    hint,
    children,
}: {
    label: string;
    htmlFor?: string;
    error?: string;
    optional?: boolean;
    hint?: string;
    children: ReactNode;
}) {
    return (
        <div>
            <div className="flex items-baseline justify-between gap-2">
                <FieldLabel htmlFor={htmlFor}>{label}</FieldLabel>
                {optional && !hint && (
                    <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-outline">
                        optional
                    </span>
                )}
                {hint && (
                    <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-outline">
                        {hint}
                    </span>
                )}
            </div>
            <div className="mt-1.5">{children}</div>
            <AnimatePresence>
                {error && (
                    <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.05em] text-[#ba1a1a]"
                    >
                        {error}
                    </motion.p>
                )}
            </AnimatePresence>
        </div>
    );
}

function TextInput({
    id,
    value,
    onChange,
    placeholder,
    invalid,
}: {
    id: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    invalid?: boolean;
}) {
    return (
        <input
            id={id}
            type="text"
            value={value}
            placeholder={placeholder}
            onChange={(e) => onChange(e.target.value)}
            className={`h-11 w-full border bg-background px-3 font-sans text-[14px] text-on-surface placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-accent ${
                invalid ? "border-[#ba1a1a]" : "border-outline-variant"
            }`}
        />
    );
}

function SelectInput({
    id,
    value,
    onChange,
    options,
    placeholder,
    invalid,
}: {
    id: string;
    value: string;
    onChange: (v: string) => void;
    options: SelectOption[];
    placeholder: string;
    invalid?: boolean;
}) {
    return (
        <div className="relative">
            <select
                id={id}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={`h-11 w-full appearance-none border bg-background px-3 pr-9 font-sans text-[14px] focus:outline-none focus:ring-1 focus:ring-accent ${
                    invalid ? "border-[#ba1a1a]" : "border-outline-variant"
                } ${value ? "text-on-surface" : "text-outline"}`}
            >
                <option value="">{placeholder}</option>
                {options.map((o) => (
                    <option key={o.id} value={o.id} className="text-on-surface">
                        {o.name}
                    </option>
                ))}
            </select>
            <ChevronDown
                size={15}
                strokeWidth={2}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-outline"
            />
        </div>
    );
}

function SlotMotion({ children, reduce }: { children: ReactNode; reduce: boolean }) {
    if (reduce) return <div>{children}</div>;
    return (
        <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: EASE }}
        >
            {children}
        </motion.div>
    );
}

/* ------------------------------------------------------------------ */
/*  Success banner                                                     */
/* ------------------------------------------------------------------ */

function SuccessBanner({
    payload,
    onDismiss,
    reduce,
}: {
    payload: NewEntryPayload;
    onDismiss: () => void;
    reduce: boolean;
}) {
    // File isn't JSON-serializable — show its metadata in the preview instead.
    const preview = {
        ...payload,
        receipt: payload.receipt
            ? {
                  name: payload.receipt.name,
                  type: payload.receipt.type,
                  size: payload.receipt.size,
              }
            : null,
    };
    return (
        <motion.div
            initial={reduce ? false : { opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="mb-4 border border-ink bg-background"
        >
            <div className="flex items-center justify-between gap-3 border-b border-outline-variant bg-ink px-4 py-2.5 text-white">
                <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.08em]">
                    <Check size={14} strokeWidth={2.5} className="text-accent" />
                    Entry captured · logged to console
                </span>
                <button
                    type="button"
                    onClick={onDismiss}
                    aria-label="Dismiss"
                    className="text-white/60 transition-colors hover:text-white"
                >
                    <X size={15} strokeWidth={2} />
                </button>
            </div>
            <pre className="overflow-x-auto px-4 py-3 font-mono text-[11px] leading-relaxed text-on-surface-variant">
                {JSON.stringify(preview, null, 2)}
            </pre>
        </motion.div>
    );
}
