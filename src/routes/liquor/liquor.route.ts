import * as HttpStatusCode from "stoker/http-status-codes"
import * as HttpStatusPhrases from "stoker/http-status-phrases"
import { createRoute, z } from "@hono/zod-openapi";
import { createErrorSchema, createMessageObjectSchema, IdUUIDParamsSchema } from "stoker/openapi/schemas";
import protect from "../../middlewares/protect";
import { jsonContent, jsonContentOneOf } from "stoker/openapi/helpers";
import { createLiquorSchema, responseLiquorSchema, responseLiquorsSchema, updateLiquorSchema } from "../../db/schema";

export const createLiquor = createRoute({
    tags: ['liquor'],
    // Category Id 
    path: "/liquor/:id",
    method: "post",
    middleware: [protect],
    request: {
        body: {
            content: {
                "multipart/form-data": {
                    schema: createLiquorSchema
                },
            },
            description: "Liquor Created",
        },
        params: IdUUIDParamsSchema
    },
    responses: {
        [HttpStatusCode.CREATED]: jsonContent(
            responseLiquorSchema,
            "Liquor Created"
        ),
        [HttpStatusCode.UNPROCESSABLE_ENTITY]: jsonContentOneOf(
            [createErrorSchema(createLiquorSchema), createErrorSchema(IdUUIDParamsSchema)],
            "Validation error",
        ),
        [HttpStatusCode.NOT_FOUND]: jsonContent(
            createMessageObjectSchema(HttpStatusPhrases.NOT_FOUND),
            HttpStatusPhrases.NOT_FOUND
        ),
        [HttpStatusCode.BAD_REQUEST]: jsonContent(
            createMessageObjectSchema(HttpStatusPhrases.BAD_REQUEST),
            HttpStatusPhrases.BAD_REQUEST
        ),
    }
})

export const getLiquorById = createRoute({
    tags: ["liquor"],
    path: "/liquor/:id",
    method: "get",
    middleware: [protect],
    request: {
        params: IdUUIDParamsSchema
    },
    responses: {
        [HttpStatusCode.OK]: jsonContent(
            responseLiquorSchema,
            "Liquor Found"
        ),
        [HttpStatusCode.NOT_FOUND]: jsonContent(
            createMessageObjectSchema(HttpStatusPhrases.NOT_FOUND),
            HttpStatusPhrases.NOT_FOUND
        ),
        [HttpStatusCode.BAD_REQUEST]: jsonContent(
            createMessageObjectSchema(HttpStatusPhrases.BAD_REQUEST),
            HttpStatusPhrases.BAD_REQUEST
        ),

        [HttpStatusCode.UNPROCESSABLE_ENTITY]: jsonContent(
            createErrorSchema(IdUUIDParamsSchema),
            HttpStatusPhrases.UNPROCESSABLE_ENTITY
        )
    }
})

export const updateLiquor = createRoute({
    tags: ["liquor"],
    method: "patch",
    path: "/liquor/:id",
    middleware: [protect],
    request: {
        params: IdUUIDParamsSchema,
        // body: jsonContent(
        //     updateLiquorSchema,
        //     "Update Liquor"
        // )

        body: {
            content: {
                "multipart/form-data": {
                    schema: updateLiquorSchema
                },
            },
            description: "Liquor Created",
        },
    },
    responses: {
        [HttpStatusCode.OK]: jsonContent(
            responseLiquorSchema,
            "Liquor Updated"
        ),
        [HttpStatusCode.UNPROCESSABLE_ENTITY]: jsonContentOneOf(
            [createErrorSchema(updateLiquorSchema), createErrorSchema(IdUUIDParamsSchema)],
            "Validation error",
        ),
        [HttpStatusCode.NOT_FOUND]: jsonContent(
            createMessageObjectSchema(HttpStatusPhrases.NOT_FOUND),
            HttpStatusPhrases.NOT_FOUND
        ),
        [HttpStatusCode.BAD_REQUEST]: jsonContent(
            createMessageObjectSchema(HttpStatusPhrases.BAD_REQUEST),
            HttpStatusPhrases.BAD_REQUEST
        ),
    }
})

export const deleteLiquor = createRoute({
    tags: ["liquor"],
    method: "delete",
    path: "/liquor/:id",
    middleware: [protect],
    request: {
        params: IdUUIDParamsSchema
    },
    responses: {
        [HttpStatusCode.OK]: jsonContent(
            createMessageObjectSchema("Liquor deleted successfully"),
            "Liquor Deleted"
        ),
        [HttpStatusCode.NOT_FOUND]: jsonContent(
            createMessageObjectSchema(HttpStatusPhrases.NOT_FOUND),
            HttpStatusPhrases.NOT_FOUND
        ),
        [HttpStatusCode.BAD_REQUEST]: jsonContent(
            createMessageObjectSchema(HttpStatusPhrases.BAD_REQUEST),
            HttpStatusPhrases.BAD_REQUEST
        ),
        [HttpStatusCode.UNPROCESSABLE_ENTITY]: jsonContent(
            createErrorSchema(IdUUIDParamsSchema),
            HttpStatusPhrases.UNPROCESSABLE_ENTITY
        )
    }
})

export const getLiquorsOfCategory = createRoute({
    tags: ["liquor"],
    path: "/category/:id/liquors",
    method: "get",
    middleware: [protect],
    request: {
        params: IdUUIDParamsSchema,
        query: z.object({
            name: z.string().optional(),
            inStock: z.enum(["true", "false"]).optional(),
            minPrice: z.coerce.number().optional(),
            maxPrice: z.coerce.number().optional(),
            sortBy: z.enum(["createdAt", "price", "name"]).optional().default("createdAt"),
            sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
            limit: z.coerce.number().min(1).max(100).optional().default(10),
            page: z.coerce.number().min(1).optional().default(1),
        }),
    },
    responses: {
        [HttpStatusCode.OK]: jsonContent(
            responseLiquorsSchema,
            "Liquors Retrieved"
        ),
        [HttpStatusCode.BAD_REQUEST]: jsonContent(
            createMessageObjectSchema(HttpStatusPhrases.BAD_REQUEST),
            HttpStatusPhrases.BAD_REQUEST
        ),
        [HttpStatusCode.NOT_FOUND]: jsonContent(
            createMessageObjectSchema("Category not found"),
            "Category Not Found"
        ),
    },
});

export type GetLiquorsOfCategorySchema = typeof getLiquorsOfCategory;


export type CreateLiquorSchema = typeof createLiquor
export type GetLiquorSchemaById = typeof getLiquorById
export type UpdateLiquorSchema = typeof updateLiquor
export type DeleteLiquorSchema = typeof deleteLiquor