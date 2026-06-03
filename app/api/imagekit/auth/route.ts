import { auth } from "@clerk/nextjs/server";
import { getUploadAuthParams } from "@imagekit/next/server";
import { NextResponse } from "next/server";

// Returns short-lived, signed params the browser needs to upload a receipt
// straight to ImageKit (the file never passes through our server). The private
// key stays server-side; only the public key + signature are handed out.
//
// Requires env: IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY.
export async function GET() {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    if (!publicKey || !privateKey) {
        console.error("ImageKit keys are not configured");
        return NextResponse.json({ error: "Uploads are not configured" }, { status: 500 });
    }

    const { token, signature, expire } = getUploadAuthParams({ publicKey, privateKey });

    // publicKey is safe to expose; the client needs it for the upload call.
    return NextResponse.json({ token, signature, expire, publicKey });
}
