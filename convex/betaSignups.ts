import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const insert = mutation({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const existing = await ctx.db
      .query("betaSignups")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (existing) {
      return { status: "duplicate" as const };
    }

    await ctx.db.insert("betaSignups", {
      email,
      signedUpAt: Date.now(),
    });

    return { status: "created" as const };
  },
});
