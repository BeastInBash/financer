import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
    try {
        const payload = req.body;
        console.log("Payload", payload)
    } catch (error) {
        return NextResponse.json({
            message: "Something went wrong",
            error
        })
    }
}
