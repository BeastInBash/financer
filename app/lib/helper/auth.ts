import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/app/lib/db";
import type { User } from "@/app/generated/prisma/client";

/**
 * Resolve the signed-in user's DB row from their Clerk session.
 *
 * `Transaction.userId`, `Account.userId`, etc. store the internal `User.id`, not
 * the Clerk id — so server code that mutates user-owned data should go through
 * here. Returns both pieces so callers can distinguish "signed out" (clerkId is
 * null → 401) from "signed in but no DB row yet" (user is null → 409, the
 * webhook hasn't provisioned them).
 */
export async function getDbUser(): Promise<{ clerkId: string | null; user: User | null }> {
    const { userId: clerkId } = await auth();
    if (!clerkId) return { clerkId: null, user: null };
    const user = await prisma.user.findUnique({ where: { clerkId } });
    return { clerkId, user };
}
