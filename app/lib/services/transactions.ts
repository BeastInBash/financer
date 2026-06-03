import type { NewEntryPayload } from "@/app/entry/new/_components/new-entry-form";

export interface TransactionRecord {
    id: string;
    type: NewEntryPayload["type"];
    title: string;
    amount: string; 
    accountId: string;
    categoryId: string | null;
    transactionDate: string;
    receiptUrl: string | null;
    createdAt: string;
}

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

export async function createNewTransaction(
    data: NewEntryPayload,
): Promise<CreateTransactionResponse> {
    const { receipt, ...rest } = data;

    // Multipart so the File rides along. Structured fields go in one JSON part;
    // the file is its own part. We do NOT set Content-Type — the browser must
    // set it together with the multipart boundary, or the server can't parse it.
    const form = new FormData();
    form.append("data", JSON.stringify(rest));
    if (receipt) form.append("receipt", receipt);

    const response = await fetch("/api/transactions", {
        method: "POST",
        body: form,
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
