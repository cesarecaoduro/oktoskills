import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  betaSignups: defineTable({
    email: v.string(),
    signedUpAt: v.number(),
  }).index("by_email", ["email"]),
});
