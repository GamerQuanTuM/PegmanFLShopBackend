import * as HttpStatusCode from "stoker/http-status-codes"
import * as HttpStatusPhrases from "stoker/http-status-phrases"
import { createRoute } from "@hono/zod-openapi";
import { createErrorSchema, createMessageObjectSchema, IdUUIDParamsSchema } from "stoker/openapi/schemas";
import protect from "../../middlewares/protect";
import { jsonContent } from "stoker/openapi/helpers";
import { createLiquorSchema, responseLiquorSchema, updateLiquorSchema } from "../../db/schema";

export const createLiquor = createRoute({
    tags: ['liquor'],
    // Category Id 
    path: "/liquor/:id",
    method: "post",
    middleware: [protect],
    request: {
        body:{
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
        [HttpStatusCode.UNPROCESSABLE_ENTITY]: jsonContent(
            createErrorSchema(createLiquorSchema),
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

        body:{
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
        [HttpStatusCode.UNPROCESSABLE_ENTITY]: jsonContent(
            createErrorSchema(updateLiquorSchema),
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
    }
})

export type CreateLiquorSchema = typeof createLiquor
export type GetLiquorSchemaById = typeof getLiquorById
export type UpdateLiquorSchema = typeof updateLiquor
export type DeleteLiquorSchema = typeof deleteLiquor