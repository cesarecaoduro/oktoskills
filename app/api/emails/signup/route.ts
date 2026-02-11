import { resend } from "@/lib/resend";
import { signupSchema } from "@/lib/schemas/signup";
import WelcomeEmail from "@/emails/welcome";
import { NextResponse } from "next/server";

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

    const { data, error } = await resend.emails.send({
      from: "OctoSkills <hello@mail.octoskills.app>",
      to: email,
      subject: "Welcome to OctoSkills — You're on the list!",
      react: WelcomeEmail({ email }),
      headers: {
        "X-Entity-Ref-ID": `early-access/${email}`,
      },
    });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
