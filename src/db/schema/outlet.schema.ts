import { relations } from "drizzle-orm";
import { pgTable, uuid, timestamp, boolean } from "drizzle-orm/pg-core";
import { z } from "zod";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { owner } from "./owner.schema";
import { outletsDetails, selectOutletsDetailsSchema } from "./outlet-details.schema";
import { outletLegalDocument, selectOutletLegalDocumentsSchema } from "./outlet-legal-document.schema";
import { outletManager, selectOutletManagerSchema } from "./outlet-manager.schema";
import { outletTiming, selectOutletTimingSchema } from "./outlet-timing.schema";
import { outletBartender, selectOutletBartenderSchema } from "./outlet-bartender.schema";
import { selectOutletTimingSlotSchema } from "./outlet-timing-slot.schema";
import { category } from "./category.schema";
import { order } from "./order.schema";

export const outlet = pgTable("outlet", {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: uuid("owner_id").references(() => owner.id).unique(),
    isVerified: boolean("is_verified").default(false),
    detailsId: uuid("details_id").references(() => outletsDetails.id),
    legalDocumentId: uuid("legal_document_id").references(() => outletLegalDocument.id),
    managerId: uuid("manager_id").references(() => outletManager.id),
    timingId: uuid("timing_id").references(() => outletTiming.id),
    bartenderId: uuid("bartender_id").references(() => outletBartender.id),
    createdAt: timestamp("created_at", { withTimezone: false }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: false }).defaultNow().$onUpdateFn(() => new Date()),
});


export const outletRelations = relations(outlet, ({ one, many }) => ({
    details: one(outletsDetails, {
        fields: [outlet.detailsId],
        references: [outletsDetails.id],
    }),
    legalDocument: one(outletLegalDocument, {
        fields: [outlet.legalDocumentId],
        references: [outletLegalDocument.id],
    }),
    manager: one(outletManager, {
        fields: [outlet.managerId],
        references: [outletManager.id],
    }),
    timing: one(outletTiming, {
        fields: [outlet.timingId],
        references: [outletTiming.id],
    }),
    bartender: one(outletBartender, {
        fields: [outlet.bartenderId],
        references: [outletBartender.id],
    }),
    owner: one(owner, {
        fields: [outlet.ownerId],
        references: [owner.id],
    }),
    categories: many(category),
    orders: many(order),
}));

export const selectOutletSchema = createSelectSchema(outlet)

export const selectOutletTimingWithSlotsSchema = selectOutletTimingSchema.extend({
    slots: z.array(selectOutletTimingSlotSchema).nullable(),
});

export const insertOutletSchema = createInsertSchema(outlet, {
    ownerId: z.string().uuid(),
    detailsId: z.string().uuid(),
    legalDocumentId: z.string().uuid(),
    managerId: z.string().uuid(),
    timingId: z.string().uuid(),
    bartenderId: z.string().uuid().optional(),
})
    .omit({
        id: true,
        createdAt: true,
        updatedAt: true,
        isVerified: true,
    })

// Doing these is a workaround to avoid circular dependency.
const ownerSchema = z.object({
    id: z.string(),
    name: z.string().nullable(),
    email: z.string().nullable(),
    mobileNumber: z.string(),
    createdAt: z.date().nullable(),
    updatedAt: z.date().nullable(),
});


export const selectOutletSchemaWithRelations = selectOutletSchema.omit({
    ownerId: true,
    detailsId: true,
    legalDocumentId: true,
    managerId: true,
    timingId: true,
    bartenderId: true,
}).extend({
    owner: ownerSchema.nullable(),
    details: selectOutletsDetailsSchema.nullable(),
    legalDocument: selectOutletLegalDocumentsSchema.nullable(),
    manager: selectOutletManagerSchema.nullable(),
    bartender: selectOutletBartenderSchema.nullable(),
    timing: selectOutletTimingWithSlotsSchema.nullable(),
})

export const outletResponseSchemaWithRelations = z.object({
    message: z.string(),
    data: selectOutletSchemaWithRelations,
});

export const outletResponseSchema = z.object({
    message: z.string(),
    data: selectOutletSchema,
});

export const updateVerifyOutletSchema = selectOutletSchema.pick({
    isVerified: true,
})





