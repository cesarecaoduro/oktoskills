import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  betaSignups: defineTable({
    email: v.string(),
    signedUpAt: v.number(),
  }).index("by_email", ["email"]),

  emailEvents: defineTable({
    emailId: v.string(),
    type: v.string(),
    from: v.string(),
    to: v.array(v.string()),
    subject: v.string(),
    receivedAt: v.number(),
  })
    .index("by_emailId", ["emailId"])
    .index("by_type", ["type"]),
});
