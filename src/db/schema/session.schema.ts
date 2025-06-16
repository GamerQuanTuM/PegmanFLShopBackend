import { relations } from "drizzle-orm";
import { pgTable, uuid, timestamp, text, time } from "drizzle-orm/pg-core";
import { owner } from "./owner.schema";


export const session = pgTable("session", {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: uuid("owner_id"),
    model: text("model"),
    expiresAt: timestamp('expires_at', { withTimezone: false }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: false }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: false }).defaultNow().$onUpdateFn(() => new Date()),
});


export const sessionRelations = relations(session, ({ one }) => ({
    owner: one(owner, {
        fields: [session.ownerId],
        references: [owner.id],
    }),
}));