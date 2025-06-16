import * as HttpStatusCode from "stoker/http-status-codes"
import * as HttpStatusPhrases from "stoker/http-status-phrases"
import { createRoute } from "@hono/zod-openapi";
import { createErrorSchema, createMessageObjectSchema, IdUUIDParamsSchema } from "stoker/openapi/schemas";
import protect from "../../middlewares/protect";
import { jsonContent } from "stoker/openapi/helpers";
import { categoriesResponseSchema, categoryResponseSchema, createCategorySchema, updateCategorySchema } from "../../db/schema";

export const createCategory = createRoute({
    tags: ['category'],
    // Outlet Id
    path: "/category/:id",
    method: "post",
    middleware: [protect],
    request: {
        body: jsonContent(createCategorySchema, "Create Category"),
        params: IdUUIDParamsSchema
    },
    responses: {
        [HttpStatusCode.CREATED]: jsonContent(
            categoryResponseSchema,
            "Category Created"
        ),
        [HttpStatusCode.UNPROCESSABLE_ENTITY]: jsonContent(
            createErrorSchema(createCategorySchema),
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

export const getCategoryById = createRoute({
    tags: ["category"],
    path: "/category/:id",
    method: "get",
    middleware: [protect],
    request: {
        params: IdUUIDParamsSchema
    },
    responses: {
        [HttpStatusCode.OK]: jsonContent(
            categoryResponseSchema,
            "Category Found"
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

export const getCategoriesOfOutlet = createRoute({
    tags:["category"],
    path: "/outlet/:id/categories",
    method: "get",
    middleware: [protect],
    request: {
        params: IdUUIDParamsSchema
    },
    responses: {
        [HttpStatusCode.OK]: jsonContent(
            categoriesResponseSchema,
            "Category Found"
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

export const updateCategory = createRoute({
    tags: ["category"],
    method: "patch",
    path: "/category/:id",
    middleware: [protect],
    request: {
        params: IdUUIDParamsSchema,
        body: jsonContent(
            updateCategorySchema,
            "Category Updated"
        )
    },
    responses: {
        [HttpStatusCode.OK]: jsonContent(
            categoryResponseSchema,
            "Category Found"
        ),
        [HttpStatusCode.UNPROCESSABLE_ENTITY]: jsonContent(
            createErrorSchema(updateCategorySchema),
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

export const deleteCategory = createRoute({
    tags: ["category"],
    method: "delete",
    path: "/category/:id",
    middleware: [protect],
    request: {
        params: IdUUIDParamsSchema
    },
    responses: {
        [HttpStatusCode.OK]: jsonContent(
            createMessageObjectSchema("Category deleted successfully"),
            "Category Deleted"
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


export type CreateCategorySchema = typeof createCategory
export type GetCategorySchemaById = typeof getCategoryById
export type GetCategoriesSchemaByOutlet = typeof getCategoriesOfOutlet
export type UpdateCategorySchema = typeof updateCategory
export type DeleteCategorySchema = typeof deleteCategory