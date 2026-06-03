import { upload, ImageKitAbortError, ImageKitServerError } from "@imagekit/next";
import type { NewEntryPayload } from "@/app/entry/new/_components/new-entry-form";

/** A single persisted transaction row, as serialized by the API. */
export interface TransactionRecord {
    id: string;
    type: NewEntryPayload["type"];
    title: string;
    amount: string; // Prisma Decimal serializes to a string over JSON
    accountId: string;
    categoryId: string | null;
    transactionDate: string;
    receiptUrl: string | null;
    createdAt: string;
}

/**
 * POST /api/transactions returns either a single record (income/expense) or a
 * pair of linked rows (transfer: money leaves `from`, lands in `to`).
 */
export type CreateTransactionResponse =
    | TransactionRecord
    | { transfer: { from: TransactionRecord; to: TransactionRecord } };

/** Thrown on a non-2xx response so callers (e.g. TanStack `onError`) get the status + server message. */
export class TransactionRequestError extends Error {
    constructor(
        message: string,
        readonly status: number,
    ) {
        super(message);
        this.name = "TransactionRequestError";
    }
}

interface ImageKitAuth {
    token: string;
    signature: string;
    expire: number;
    publicKey: string;
}

/**
 * Upload a receipt straight from the browser to ImageKit and return its URL.
 * We fetch short-lived signed params from our server first, then hand the file
 * directly to ImageKit so it never round-trips through our API.
 */
export async function uploadReceipt(file: File): Promise<string> {
    const authRes = await fetch("/api/imagekit/auth");
    if (!authRes.ok) {
        throw new TransactionRequestError("Could not authorize the receipt upload", authRes.status);
    }
    const { token, signature, expire, publicKey } = (await authRes.json()) as ImageKitAuth;

    try {
        const result = await upload({
            file,
            fileName: file.name || "receipt",
            token,
            signature,
            expire,
            publicKey,
            folder: "/financer/receipts",
        });
        if (!result.url) {
            throw new Error("Upload completed but no URL was returned");
        }
        return result.url;
    } catch (err) {
        if (err instanceof ImageKitAbortError) throw new Error("Receipt upload was cancelled");
        if (err instanceof ImageKitServerError) throw new Error("ImageKit rejected the receipt");
        throw err instanceof Error ? err : new Error("Receipt upload failed");
    }
}

export async function createNewTransaction(
    data: NewEntryPayload,
): Promise<CreateTransactionResponse> {
    const { receipt, ...rest } = data;

    // Receipt goes browser → ImageKit first; we only send the resulting URL to
    // our API, so the transaction request stays plain JSON.
    const receiptUrl = receipt ? await uploadReceipt(receipt) : null;

    const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...rest, receiptUrl }),
    });

    if (!response.ok) {
        const message = await response
            .json()
            .then((b) => b?.error ?? b?.message)
            .catch(() => null);
        throw new TransactionRequestError(
            message ?? `Request failed (${response.status})`,
            response.status,
        );
    }

    return response.json() as Promise<CreateTransactionResponse>;
}
