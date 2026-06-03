import type { AccountType } from "@/app/generated/prisma/enums";

export interface AccountRecord {
    id: string;
    name: string;
    type: AccountType;
    balance: string; // Decimal serialized as string
    currency: string;
}

export interface CreateAccountInput {
    name: string;
    type: AccountType;
    balance?: number;
    currency?: string;
}

export class RequestError extends Error {
    constructor(
        message: string,
        readonly status: number,
    ) {
        super(message);
        this.name = "RequestError";
    }
}

async function readError(response: Response): Promise<string | null> {
    return response
        .json()
        .then((b) => b?.error ?? b?.message)
        .catch(() => null);
}

export async function createAccount(input: CreateAccountInput): Promise<AccountRecord> {
    const response = await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
    });
    if (!response.ok) {
        const message = await readError(response);
        throw new RequestError(message ?? `Request failed (${response.status})`, response.status);
    }
    return response.json() as Promise<AccountRecord>;
}
