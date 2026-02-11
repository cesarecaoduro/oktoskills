import { resend } from "@/lib/resend";
import { NextRequest, NextResponse } from "next/server";
import { fetchMutation } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("RESEND_WEBHOOK_SECRET is not set");
    return new NextResponse("Webhook secret not configured", { status: 500 });
  }

  try {
    // Must use request.text() — signature verification needs the raw body
    const payload = await request.text();

    const event = resend.webhooks.verify({
      payload,
      headers: {
        id: request.headers.get("svix-id") ?? "",
        timestamp: request.headers.get("svix-timestamp") ?? "",
        signature: request.headers.get("svix-signature") ?? "",
      },
      webhookSecret,
    });

    // Track email lifecycle events in Convex
    if ("email_id" in event.data) {
      const { email_id, from, to, subject } = event.data;

      await fetchMutation(api.emailEvents.insert, {
        emailId: email_id,
        type: event.type,
        from,
        to,
        subject,
        receivedAt: Date.now(),
      });

      // Forward inbound emails to admin
      if (event.type === "email.received") {
        try {
          await resend.emails.send({
            from: "OctoSkills <hello@mail.octoskills.app>",
            to: "cesare.caoduro@gmail.com",
            subject: `Fwd: ${subject}`,
            text: `New email received from ${from}\n\nTo: ${to.join(", ")}\nSubject: ${subject}`,
          });
        } catch (fwdError) {
          console.error("Failed to forward inbound email:", fwdError);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook verification failed:", error);
    return new NextResponse("Invalid webhook signature", { status: 400 });
  }
}
