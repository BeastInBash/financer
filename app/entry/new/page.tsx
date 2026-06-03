import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/db";
import { getDbUser } from "@/app/lib/helper/auth";
import { NewEntryForm } from "./_components/new-entry-form";

// Always reflect the latest accounts/categories (they can be created inline).
export const dynamic = "force-dynamic";

export default async function NewEntryPage() {
    const { clerkId, user } = await getDbUser();
    if (!clerkId) redirect("/sign-in?redirect_url=/entry/new");
    if (!user) {
        // Signed in but the Clerk webhook hasn't created the DB row yet.
        return (
            <div className="grid min-h-screen place-items-center p-6">
                <p className="max-w-sm text-center font-mono text-[12px] uppercase tracking-[0.06em] text-on-surface-variant">
                    Your account is still being set up. Refresh in a moment.
                </p>
            </div>
        );
    }

    const [accounts, categories] = await Promise.all([
        prisma.account.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: "asc" },
            select: { id: true, name: true },
        }),
        prisma.category.findMany({
            where: { userId: user.id },
            orderBy: { name: "asc" },
            select: { id: true, name: true },
        }),
    ]);

    return <NewEntryForm accounts={accounts} categories={categories} currency={user.currency} />;
}
