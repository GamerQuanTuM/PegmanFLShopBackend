import { pgTable, uuid, timestamp, integer, doublePrecision } from "drizzle-orm/pg-core";
import { z } from "zod";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { liquor } from "./liquor.schema";
import { orderStatus } from "./enums";

export const order = pgTable("order", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    status:orderStatus("order_status").notNull(),
    price: doublePrecision("price").notNull(),
    createdAt: timestamp("created_at", { withTimezone: false }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: false }).defaultNow().$onUpdateFn(() => new Date()),
});


export const orderItem = pgTable("order_item", {
    id: uuid("id").primaryKey().defaultRandom(),
    liquorId: uuid("liquor_id").references(() => liquor.id).unique(),
    orderId: uuid("order_id").references(() => order.id).unique(),
    quantity: integer("quantity").notNull(),
    createdAt: timestamp("created_at", { withTimezone: false }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: false }).defaultNow().$onUpdateFn(() => new Date()),
})

export const orderRelations = relations(order, ({ many }) => ({
    order: many(orderItem)
}))

export const orderItemRelations = relations(orderItem, ({ one }) => ({
    order: one(order, {
        fields: [orderItem.orderId],
        references: [order.id]
    }),

    liquor: one(liquor, {
        fields: [orderItem.liquorId],
        references: [liquor.id],
    })
}))


export const selectOrderSchema = createSelectSchema(order)
export const createOrderSchema = createInsertSchema(order).omit({
    id: true,
    createdAt: true,
    updatedAt: true
})

export const updateOrderSchema = createOrderSchema.optional()

export const responseOrderSchema = z.object({
    message: z.string(),
    data: selectOrderSchema
})