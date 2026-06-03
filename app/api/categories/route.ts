import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";
import { getDbUser } from "@/app/lib/helper/auth";

function serialize(c: { id: string; name: string; color: string | null; icon: string | null }) {
    return { id: c.id, name: c.name, color: c.color, icon: c.icon };
}

export async function GET() {
    const { clerkId, user } = await getDbUser();
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!user) return NextResponse.json({ error: "User not provisioned yet" }, { status: 409 });

    const categories = await prisma.category.findMany({
        where: { userId: user.id },
        orderBy: { name: "asc" },
    });
    return NextResponse.json(categories.map(serialize));
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
            return NextResponse.json({ error: "Category name is required" }, { status: 400 });
        }
        const color = typeof b.color === "string" && b.color.trim() ? b.color.trim() : null;
        const icon = typeof b.icon === "string" && b.icon.trim() ? b.icon.trim() : null;

        const category = await prisma.category.create({
            data: { userId: user.id, name: b.name.trim(), color, icon },
        });
        return NextResponse.json(serialize(category), { status: 201 });
    } catch (error) {
        // @@unique([userId, name]) — duplicate name for this user.
        if ((error as { code?: string }).code === "P2002") {
            return NextResponse.json({ error: "A category with that name already exists" }, { status: 409 });
        }
        console.error("POST /api/categories failed:", error);
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
}
