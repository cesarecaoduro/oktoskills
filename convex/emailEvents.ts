import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const insert = mutation({
  args: {
    emailId: v.string(),
    type: v.string(),
    from: v.string(),
    to: v.array(v.string()),
    subject: v.string(),
    receivedAt: v.number(),
  },
  handler: async (ctx, args) => {
    // Deduplicate by emailId + type to handle webhook retries
    const existing = await ctx.db
      .query("emailEvents")
      .withIndex("by_emailId", (q) => q.eq("emailId", args.emailId))
      .collect();

    if (existing.some((e) => e.type === args.type)) {
      return { status: "duplicate" as const };
    }

    await ctx.db.insert("emailEvents", args);
    return { status: "created" as const };
  },
});
