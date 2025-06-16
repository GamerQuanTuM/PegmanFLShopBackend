import { pgTable, varchar, uuid, timestamp, boolean } from "drizzle-orm/pg-core";
import { z } from "zod";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { outlet } from "./outlet.schema";
import { liquor } from "./liquor.schema";

export const category = pgTable("category", {
    id: uuid("id").primaryKey().defaultRandom(),
    outletId: uuid("outlet_id").references(() => outlet.id).unique(),
    name: varchar("name", { length: 255 }),
    is_available: boolean("is_available").default(true),
    createdAt: timestamp("created_at", { withTimezone: false }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: false }).defaultNow().$onUpdateFn(() => new Date()),
});

export const categoryRelations = relations(category, ({ one, many }) => ({
    outlet: one(outlet, {
        fields: [category.outletId],
        references: [outlet.id],
    }),
    liquors: many(liquor)
}))


export const selectCategorySchema = createSelectSchema(category)
export const createCategorySchema = createInsertSchema(category).extend({
    isAvailable: z.boolean()
}).omit({
    id: true,
    is_available: true,
    outletId: true,
    createdAt: true,
    updatedAt: true
})

export const updateCategorySchema = z.object({
    name: z.string().max(255).optional(),
    isAvailable: z.boolean().optional()
});

export const categoryResponseSchema = z.object({
    message: z.string(),
    data: selectCategorySchema
})