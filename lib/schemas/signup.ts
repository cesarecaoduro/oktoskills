import { z } from "zod";

export const signupSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address")
    .max(255, "Email is too long")
    .transform((e) => e.toLowerCase().trim()),
});

export type SignupInput = z.input<typeof signupSchema>;
