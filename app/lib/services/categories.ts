import { RequestError } from "@/app/lib/services/accounts";

export interface CategoryRecord {
    id: string;
    name: string;
    color: string | null;
    icon: string | null;
}

export interface CreateCategoryInput {
    name: string;
    color?: string;
    icon?: string;
}

export async function createCategory(input: CreateCategoryInput): Promise<CategoryRecord> {
    const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
    });
    if (!response.ok) {
        const message = await response
            .json()
            .then((b) => b?.error ?? b?.message)
            .catch(() => null);
        throw new RequestError(message ?? `Request failed (${response.status})`, response.status);
    }
    return response.json() as Promise<CategoryRecord>;
}
