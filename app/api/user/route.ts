import { prisma } from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (request: NextRequest) => {
    try {
        const user = await prisma.user.findMany();
        if (!user) {
            return NextResponse.json({
                message: "No User found"
            })
        }
        console.log("USERS", user)
        return NextResponse.json({
            message: "User fetched",
            user
        })
    } catch (error) {
        console.log("error", error)
    }
}
