import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";
import { getDbUser } from "@/app/lib/helper/auth";
import { AccountType } from "@/app/generated/prisma/enums";

function serialize(a: {
    id: string;
    name: string;
    type: AccountType;
    balance: unknown;
    currency: string;
}) {
    return { id: a.id, name: a.name, type: a.type, balance: String(a.balance), currency: a.currency };
}

export async function GET() {
    const { clerkId, user } = await getDbUser();
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!user) return NextResponse.json({ error: "User not provisioned yet" }, { status: 409 });

    const accounts = await prisma.account.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(accounts.map(serialize));
}

export async function POST(req: NextRequest) {
    try {
        const { clerkId, user } = await getDbUser();
        if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        if (!user) return NextResponse.json({ error: "User not provisioned yet" }, { status: 409 });

        let body: unknown;
        try {
            body = await req.json();
        } catch {
            return NextResponse.json({ error: "Body must be JSON" }, { status: 400 });
        }
        const b = (body ?? {}) as Record<string, unknown>;

        if (typeof b.name !== "string" || !b.name.trim()) {
            return NextResponse.json({ error: "Account name is required" }, { status: 400 });
        }
        if (!Object.values(AccountType).includes(b.type as AccountType)) {
            return NextResponse.json({ error: "Invalid account type" }, { status: 400 });
        }
        // Opening balance is optional; default 0. Must be a finite number if given.
        let balance = 0;
        if (b.balance != null && b.balance !== "") {
            const n = typeof b.balance === "number" ? b.balance : Number(b.balance);
            if (!Number.isFinite(n)) {
                return NextResponse.json({ error: "Balance must be a number" }, { status: 400 });
            }
            balance = n;
        }
        const currency =
            typeof b.currency === "string" && b.currency.trim() ? b.currency.trim() : user.currency;

        const account = await prisma.account.create({
            data: {
                userId: user.id,
                name: b.name.trim(),
                type: b.type as AccountType,
                balance,
                currency,
            },
        });
        return NextResponse.json(serialize(account), { status: 201 });
    } catch (error) {
        console.error("POST /api/accounts failed:", error);
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
}
