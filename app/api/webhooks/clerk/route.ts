import { prisma } from "@/app/lib/db";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import type { NextRequest } from "next/server";

// Clerk POSTs every subscribed event to this Route Handler.
// (Route Handlers use named HTTP-verb exports and the Web Request/Response APIs.)
//
// Prerequisites for this to actually receive traffic:
//   1. `/api/webhooks(.*)` must be listed in `isPublicRoute` in proxy.ts, otherwise
//      auth.protect() rejects Clerk's unauthenticated (but signed) request.
//   2. CLERK_WEBHOOK_SIGNING_SECRET must be set in .env — verifyWebhook reads it automatically.
export async function POST(req: NextRequest) {
    // 1. Verify the signature FIRST. This is the trust gate: it proves the request
    //    really came from Clerk. If it throws, the request is forged/corrupt — bail with 400.
    let evt;
    try {
        evt = await verifyWebhook(req);
    } catch (err) {
        console.error("Clerk webhook verification failed:", err);
        return new Response("Webhook verification failed", { status: 400 });
    }

    // 2. Log the verified event so you can watch payloads land in your terminal.
    console.log(`Clerk webhook received: ${evt.type}`);
    console.log("Payload:", JSON.stringify(evt.data, null, 2));

    switch (evt.type) {
        case "user.created":
        case "user.updated": {
            console.log("Event Data", evt.data)
            const { id, username, image_url, email_addresses, primary_email_address_id } = evt.data;

            const email =
                email_addresses.find((e) => e.id === primary_email_address_id)?.email_address ??
                email_addresses[0]?.email_address;


            await prisma.user.upsert({
                where: { clerkId: id },
                create: { clerkId: id, email: email, username: username || "", profile_picture: image_url },
                update: { email, username: username || "", profile_picture: image_url },
            });
            break;
        }

        case "user.deleted": {
            // Deleted payloads only carry the id (and `deleted: true`).
            const { id } = evt.data;

            console.log("User to delete:", id);

            // --- HOW TO STORE THIS IN THE DB ---
            // Remove the matching row. Guard against "record not found" since Clerk could
            // send a delete for a user you never persisted:
            //
            //   await prisma.user.deleteMany({ where: { clerkId: id } });
            //   // deleteMany (not delete) is a no-op when no row matches, so it won't throw.
            break;
        }

        default:
            // Any event type you didn't subscribe to / don't care about: ignore it.
            break;
    }

    // 4. Return 2xx so Clerk marks delivery as successful. A non-2xx makes Clerk
    //    retry with backoff — return 500 only when you genuinely want a retry.
    return new Response("Webhook processed", { status: 200 });
}
