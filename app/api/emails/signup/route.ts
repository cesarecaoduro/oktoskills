import { resend } from "@/lib/resend";
import { signupSchema } from "@/lib/schemas/signup";
import WelcomeEmail from "@/emails/welcome";
import AdminNotificationEmail from "@/emails/admin-notification";
import { NextResponse } from "next/server";
import { fetchMutation } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = signupSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message ?? "Invalid email" },
        { status: 400 },
      );
    }

    const { email } = result.data;

    // Persist to Convex (also handles duplicate check)
    const { status } = await fetchMutation(api.betaSignups.insert, { email });

    if (status === "duplicate") {
      // Already signed up — return success without sending emails again
      return NextResponse.json({ success: true, duplicate: true });
    }

    // Send welcome email to user
    const { error: welcomeError } = await resend.emails.send({
      from: "OctoSkills <hello@mail.octoskills.app>",
      to: email,
      subject: "Welcome to OctoSkills — You're on the list!",
      react: WelcomeEmail({ email }),
      headers: {
        "X-Entity-Ref-ID": `early-access/${email}`,
      },
    });

    if (welcomeError) {
      console.error("Failed to send welcome email:", welcomeError);
    }

    // Send admin notification
    try {
      await resend.emails.send({
        from: "OctoSkills <hello@mail.octoskills.app>",
        to: "cesare.caoduro@gmail.com",
        subject: `New beta signup: ${email}`,
        react: AdminNotificationEmail({
          email,
          signedUpAt: new Date().toISOString(),
        }),
      });
    } catch (adminError) {
      console.error("Failed to send admin notification:", adminError);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
