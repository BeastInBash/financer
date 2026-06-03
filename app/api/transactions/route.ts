import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";
import { TransactionType } from "@/app/generated/prisma/enums";

const MAX_RECEIPT_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_RECEIPT_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
];

interface NewEntryData {
    type: TransactionType;
    title: string;
    amount: number;
    accountId: string;
    toAccountId: string | null;
    categoryId: string | null;
    transactionDate: string;
    notes: string | null;
    tags: string[];
}

function badRequest(message: string) {
    return NextResponse.json({ error: message }, { status: 400 });
}

/** Re-validate everything server-side — never trust the client. */
function validate(raw: unknown): { ok: true; data: NewEntryData } | { ok: false; error: string } {
    if (typeof raw !== "object" || raw === null) {
        return { ok: false, error: "Malformed body" };
    }
    const b = raw as Record<string, unknown>;

    if (!Object.values(TransactionType).includes(b.type as TransactionType)) {
        return { ok: false, error: "Invalid transaction type" };
    }
    const type = b.type as TransactionType;

    if (typeof b.title !== "string" || !b.title.trim()) {
        return { ok: false, error: "Title is required" };
    }
    if (typeof b.amount !== "number" || !Number.isFinite(b.amount) || b.amount <= 0) {
        return { ok: false, error: "Amount must be a number greater than 0" };
    }
    if (typeof b.accountId !== "string" || !b.accountId) {
        return { ok: false, error: "An account is required" };
    }

    const toAccountId = b.toAccountId == null ? null : String(b.toAccountId);
    if (type === TransactionType.TRANSFER) {
        if (!toAccountId) return { ok: false, error: "Transfers need a destination account" };
        if (toAccountId === b.accountId) {
            return { ok: false, error: "Destination must differ from source account" };
        }
    }

    const transactionDate = typeof b.transactionDate === "string" ? new Date(b.transactionDate) : new Date(NaN);
    if (Number.isNaN(transactionDate.getTime())) {
        return { ok: false, error: "Invalid transaction date" };
    }

    const tags = Array.isArray(b.tags)
        ? b.tags.filter((t): t is string => typeof t === "string" && t.trim().length > 0).map((t) => t.trim())
        : [];

    return {
        ok: true,
        data: {
            type,
            title: b.title.trim(),
            amount: b.amount,
            accountId: b.accountId,
            // Transfers carry no category; otherwise coerce empty string → null.
            toAccountId: type === TransactionType.TRANSFER ? toAccountId : null,
            categoryId:
                type === TransactionType.TRANSFER || !b.categoryId ? null : String(b.categoryId),
            transactionDate: transactionDate.toISOString(),
            notes: typeof b.notes === "string" && b.notes.trim() ? b.notes.trim() : null,
            tags,
        },
    };
}

export const POST = async (req: NextRequest) => {
    try {
        // 1. Identity. proxy.ts already blocks signed-out requests to /api/*,
        //    but still need the userId here (and it's cheap — no network call).
        const { userId: clerkId } = await auth();
        if (!clerkId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        let form: FormData;
        try {
            form = await req.formData();
        } catch {
            return badRequest("Expected multipart/form-data");
        }

        const rawData = form.get("data");
        if (typeof rawData !== "string") return badRequest("Missing 'data' part");

        let parsed: unknown;
        try {
            parsed = JSON.parse(rawData);
        } catch {
            return badRequest("'data' part is not valid JSON");
        }

        const result = validate(parsed);
        if (!result.ok) return badRequest(result.error);
        const data = result.data;

      
        const receipt = form.get("receipt");
        if (receipt instanceof File) {
            if (receipt.size > MAX_RECEIPT_BYTES) return badRequest("Receipt exceeds 5 MB");
            if (!ALLOWED_RECEIPT_TYPES.includes(receipt.type)) {
                return badRequest("Receipt must be a JPEG, PNG, WebP, or PDF");
            }
        }
        // Before this implement image kit or cloudinary to store the image / pdf 
        const receiptUrl: string | null = null; // TODO: upload `receipt` to storage, store URL

        // 4. Resolve our internal user (Transaction.userId is User.id, not the Clerk id).
        const user = await prisma.user.findUnique({
            where: { clerkId },
            select: { id: true },
        });
        if (!user) {
            return NextResponse.json({ error: "User not provisioned yet" }, { status: 409 });
        }

        // 5. Authorize every referenced row against THIS user (prevents writing into
        //    someone else's account/category by guessing a UUID).
        const accountIds = [data.accountId, ...(data.toAccountId ? [data.toAccountId] : [])];
        const ownedAccounts = await prisma.account.count({
            where: { id: { in: accountIds }, userId: user.id },
        });
        if (ownedAccounts !== accountIds.length) {
            return NextResponse.json({ error: "Account not found" }, { status: 404 });
        }
        if (data.categoryId) {
            const ownedCategory = await prisma.category.count({
                where: { id: data.categoryId, userId: user.id },
            });
            if (ownedCategory === 0) {
                return NextResponse.json({ error: "Category not found" }, { status: 404 });
            }
        }

        // Tags: upsert by the (userId, name) unique key, then link via TransactionTag.
        const tagsCreate = data.tags.length
            ? {
                  create: data.tags.map((name) => ({
                      tag: {
                          connectOrCreate: {
                              where: { userId_name: { userId: user.id, name } },
                              create: { userId: user.id, name },
                          },
                      },
                  })),
              }
            : undefined;

        // 6. Persist atomically: insert + balance move(s) all-or-nothing.
        const created = await prisma.$transaction(async (tx) => {
            if (data.type === TransactionType.TRANSFER) {
                // The schema has no toAccountId on Transaction, so a transfer is two
                // linked rows: an outflow from source and an inflow to destination.
                const from = await tx.transaction.create({
                    data: {
                        userId: user.id,
                        accountId: data.accountId,
                        title: data.title,
                        notes: data.notes,
                        amount: data.amount,
                        type: TransactionType.TRANSFER,
                        transactionDate: new Date(data.transactionDate),
                        receiptUrl,
                        tags: tagsCreate,
                    },
                });
                const to = await tx.transaction.create({
                    data: {
                        userId: user.id,
                        accountId: data.toAccountId!,
                        title: data.title,
                        notes: data.notes,
                        amount: data.amount,
                        type: TransactionType.TRANSFER,
                        transactionDate: new Date(data.transactionDate),
                    },
                });
                await tx.account.update({
                    where: { id: data.accountId },
                    data: { balance: { decrement: data.amount } },
                });
                await tx.account.update({
                    where: { id: data.toAccountId! },
                    data: { balance: { increment: data.amount } },
                });
                return { transfer: { from, to } };
            }

            const row = await tx.transaction.create({
                data: {
                    userId: user.id,
                    accountId: data.accountId,
                    categoryId: data.categoryId,
                    title: data.title,
                    notes: data.notes,
                    amount: data.amount,
                    type: data.type,
                    transactionDate: new Date(data.transactionDate),
                    receiptUrl,
                    tags: tagsCreate,
                },
            });
            await tx.account.update({
                where: { id: data.accountId },
                data: {
                    balance:
                        data.type === TransactionType.INCOME
                            ? { increment: data.amount }
                            : { decrement: data.amount },
                },
            });
            return row;
        });

        return NextResponse.json(created, { status: 201 });
    } catch (error) {
        console.error("POST /api/transactions failed:", error);
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
};
