import { pgTable, varchar, uuid, timestamp, boolean, text, integer, doublePrecision }
    from "drizzle-orm/pg-core";
import { z } from "zod";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { category } from "./category.schema";
import { orderItem } from "./order.schema";

export const liquor = pgTable("liquor", {
    id: uuid("id").primaryKey().defaultRandom(),
    categoryId: uuid("category_id").references(() => category.id).unique(),
    image: varchar("image", { length: 255 }),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    quantity: integer("quantity").notNull(),
    price: doublePrecision("price").notNull(),
    inStock: boolean("in_stock").default(true),
    createdAt: timestamp("created_at", { withTimezone: false }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: false }).defaultNow().$onUpdateFn(() => new Date()),
});

export const liquorRelations = relations(liquor, ({ one }) => ({
    category: one(category, {
        fields: [liquor.categoryId],
        references: [category.id],
    }),
    orderItem: one(orderItem)
}))


export const selectLiquorSchema = createSelectSchema(liquor)

export const createLiquorSchema = createInsertSchema(liquor).omit({
    id: true,
    categoryId: true,
    createdAt: true,
    updatedAt: true,
    image: true
}).extend({
    image: z.any(),
    quantity: z.coerce.number().int().min(0),
    price: z.coerce.number().min(0),
    inStock: z.coerce.boolean()
})

export const updateLiquorSchema = createLiquorSchema.partial()

export const responseLiquorSchema = z.object({
    message: z.string(),
    data: selectLiquorSchema
})