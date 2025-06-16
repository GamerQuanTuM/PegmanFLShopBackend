import { relations } from "drizzle-orm";
import { pgTable, varchar, uuid, timestamp, text } from "drizzle-orm/pg-core";

import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { outlet } from "./outlet.schema";
import { session } from "./session.schema";

export const owner = pgTable("owner", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name"),
    email: text("email"),
    mobileNumber: varchar("mobile_number", { length: 10 }).notNull().unique(),
    createdAt: timestamp("created_at", { withTimezone: false }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: false }).defaultNow().$onUpdateFn(() => new Date()),
});

export const ownerRelations = relations(owner, ({ many, one }) => ({
    outlets: one(outlet),
    sessions: many(session)
}));

export type Owner = typeof owner.$inferSelect;

export const selectOwnerSchema = createSelectSchema(owner)

export const ownerOtpSchema = selectOwnerSchema.pick({
    mobileNumber: true,
});

export const selectOtpSchema = ownerOtpSchema.extend({
    otp: z.string(),
    model: z.string().optional()
});

export const ownerResponseSchema = z.object({
    message: z.string(),
    data: ownerOtpSchema
})

export const updateOwnerSchema = createSelectSchema(owner).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    mobileNumber: true
}).partial();

export const updateOwnerResponseSchema = z.object({
    message: z.string(),
    data: updateOwnerSchema
})

