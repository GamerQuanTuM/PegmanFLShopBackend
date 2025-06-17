import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCode from "stoker/http-status-codes"
import * as HttpStatusPhrases from "stoker/http-status-phrases";
import { createErrorSchema, createMessageObjectSchema, IdUUIDParamsSchema } from "stoker/openapi/schemas";
import { jsonContent, jsonContentOneOf } from "stoker/openapi/helpers";
import protect from "../../middlewares/protect";
import { responseOrderSchema, responseOrdersSchema } from "../../db/schema";
import { orderStatus } from "../../db/schema/enums";

const getOrdersSchema = z.object({
    search: z.string().optional(),
    sortBy: z.enum(["createdAt", "updatedAt", "price", "status"]).optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
    page: z.number().optional(),
    limit: z.number().optional(),
    status: z.enum(orderStatus.enumValues).optional(),
    minPrice: z.string().optional(),
    maxPrice: z.string().optional(),
    from: z.string().optional(),
    to: z.string().optional()
})

export const getOrdersOfOutlet = createRoute({
    tags: ["order"],
    path: "/order/:id",
    method: "get",
    middleware: [protect],
    request: {
        params: IdUUIDParamsSchema,
        query: getOrdersSchema,
    },
    responses: {
        [HttpStatusCode.OK]: jsonContent(
            responseOrdersSchema,
            HttpStatusPhrases.OK
        ),
        [HttpStatusCode.NOT_FOUND]: jsonContent(
            createMessageObjectSchema(HttpStatusPhrases.NOT_FOUND),
            HttpStatusPhrases.NOT_FOUND
        ),

        [HttpStatusCode.UNPROCESSABLE_ENTITY]: jsonContentOneOf(
            [createErrorSchema(IdUUIDParamsSchema), createErrorSchema(getOrdersSchema)],
            HttpStatusPhrases.UNPROCESSABLE_ENTITY
        )
    }
});

export const getOutletById = createRoute({
    tags: ["order"],
    method: "get",
    path: "/order/:id",
    middleware: [protect],
    request: {
        params: IdUUIDParamsSchema
    },
    responses: {
        [HttpStatusCode.OK]: jsonContent(
            responseOrderSchema,
            HttpStatusPhrases.OK
        ),
        [HttpStatusCode.NOT_FOUND]: jsonContent(
            createMessageObjectSchema(HttpStatusPhrases.NOT_FOUND),
            HttpStatusPhrases.NOT_FOUND
        ),
        [HttpStatusCode.UNPROCESSABLE_ENTITY]: jsonContent(
            createErrorSchema(IdUUIDParamsSchema),
            HttpStatusPhrases.UNPROCESSABLE_ENTITY
        )
    }
})


export type GetOrdersSchema = typeof getOrdersOfOutlet
export type GetOutletByIdSchema = typeof getOutletById