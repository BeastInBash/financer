"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Plus, X, Loader2 } from "lucide-react";
import { AccountType } from "@/app/generated/prisma/enums";
import { createAccount } from "@/app/lib/services/accounts";
import { createCategory } from "@/app/lib/services/categories";

const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
    [AccountType.CASH]: "Cash",
    [AccountType.BANK]: "Bank",
    [AccountType.CREDIT_CARD]: "Credit Card",
    [AccountType.WALLET]: "Wallet",
    [AccountType.INVESTMENT]: "Investment",
};

const inputCls =
    "h-10 w-full border border-outline-variant bg-background px-3 font-sans text-[14px] text-on-surface placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-accent";

function ToggleButton({ label, onClick }: { label: string; onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.06em] text-on-surface-variant transition-colors hover:text-accent"
        >
            <Plus size={12} strokeWidth={2.5} />
            {label}
        </button>
    );
}

function Panel({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
    return (
        <div className="mt-2 border border-outline-variant bg-surface-low p-3">
            <div className="mb-2 flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-outline">
                    New
                </span>
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Cancel"
                    className="text-outline transition-colors hover:text-on-surface"
                >
                    <X size={14} strokeWidth={2} />
                </button>
            </div>
            {children}
        </div>
    );
}

function SubmitRow({
    pending,
    onSubmit,
    label = "Add",
}: {
    pending: boolean;
    onSubmit: () => void;
    label?: string;
}) {
    return (
        <button
            type="button"
            disabled={pending}
            onClick={onSubmit}
            className="mt-2 inline-flex h-9 items-center justify-center gap-2 bg-ink px-4 font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-white transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
        >
            {pending && <Loader2 size={13} strokeWidth={2.5} className="animate-spin" />}
            {label}
        </button>
    );
}

function ErrorText({ message }: { message: string }) {
    return (
        <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.05em] text-[#ba1a1a]">
            {message}
        </p>
    );
}

/* ------------------------------------------------------------------ */
/*  Account                                                            */
/* ------------------------------------------------------------------ */

export function CreateAccountControl({
    currency,
    onCreated,
}: {
    currency: string;
    onCreated: (id: string) => void;
}) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [type, setType] = useState<AccountType>(AccountType.BANK);
    const [balance, setBalance] = useState("");

    const mutation = useMutation({
        mutationFn: createAccount,
        onSuccess: (acc) => {
            onCreated(acc.id);
            setOpen(false);
            setName("");
            setBalance("");
            setType(AccountType.BANK);
            router.refresh();
        },
    });

    function submit() {
        if (!name.trim()) return;
        const opening = balance.trim() === "" ? undefined : Number(balance);
        mutation.mutate({ name: name.trim(), type, balance: opening });
    }

    if (!open) return <ToggleButton label="New account" onClick={() => setOpen(true)} />;

    return (
        <Panel onClose={() => setOpen(false)}>
            <input
                autoFocus
                className={inputCls}
                placeholder="Account name (e.g. HDFC Savings)"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />
            <div className="mt-2 grid grid-cols-2 gap-2">
                <select
                    className={`${inputCls} appearance-none`}
                    value={type}
                    onChange={(e) => setType(e.target.value as AccountType)}
                >
                    {Object.values(AccountType).map((t) => (
                        <option key={t} value={t}>
                            {ACCOUNT_TYPE_LABELS[t]}
                        </option>
                    ))}
                </select>
                <div className="flex items-stretch border border-outline-variant bg-background focus-within:ring-1 focus-within:ring-accent">
                    <span className="grid w-12 place-items-center border-r border-outline-variant font-mono text-[10px] uppercase text-outline">
                        {currency}
                    </span>
                    <input
                        inputMode="decimal"
                        className="w-full bg-transparent px-2 font-mono text-[13px] text-on-surface placeholder:text-outline focus:outline-none"
                        placeholder="0.00"
                        value={balance}
                        onChange={(e) => setBalance(e.target.value)}
                    />
                </div>
            </div>
            {mutation.isError && <ErrorText message={mutation.error.message} />}
            <SubmitRow pending={mutation.isPending} onSubmit={submit} label="Add account" />
        </Panel>
    );
}

/* ------------------------------------------------------------------ */
/*  Category                                                           */
/* ------------------------------------------------------------------ */

export function CreateCategoryControl({ onCreated }: { onCreated: (id: string) => void }) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");

    const mutation = useMutation({
        mutationFn: createCategory,
        onSuccess: (cat) => {
            onCreated(cat.id);
            setOpen(false);
            setName("");
            router.refresh();
        },
    });

    function submit() {
        if (!name.trim()) return;
        mutation.mutate({ name: name.trim() });
    }

    if (!open) return <ToggleButton label="New category" onClick={() => setOpen(true)} />;

    return (
        <Panel onClose={() => setOpen(false)}>
            <input
                autoFocus
                className={inputCls}
                placeholder="Category name (e.g. Salary)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        e.preventDefault();
                        submit();
                    }
                }}
            />
            {mutation.isError && <ErrorText message={mutation.error.message} />}
            <SubmitRow pending={mutation.isPending} onSubmit={submit} label="Add category" />
        </Panel>
    );
}
