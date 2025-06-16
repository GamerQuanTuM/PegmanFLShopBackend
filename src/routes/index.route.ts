import createRouter from "../lib/create-app";
import { createRoute } from "@hono/zod-openapi";
import { jsonContent } from "stoker/openapi/helpers";
import * as HttpStatusCode from "stoker/http-status-codes";
import { createMessageObjectSchema } from "stoker/openapi/schemas";
// import { createIndex, indexExists } from "@/helpers/elastic-search";
// import { outletMapping, passesMapping, outletIdx, passesIdx } from "@/constants/indexes/outlet-index";

const router = createRouter()
    .openapi(createRoute({
        tags: ["Health Check"],
        method: "get",
        path: "/",
        responses: {
            [HttpStatusCode.OK]: jsonContent(
                createMessageObjectSchema("Pegman FL Shop API"),
                "Pegman API Index"
            ),

            [HttpStatusCode.INTERNAL_SERVER_ERROR]:jsonContent(
                createMessageObjectSchema("Error"),
                "Error"
            )
        }
    }), async (c) => {
        try {
            return c.json({
                message: "Pegman FL Shop server is running",
            }, HttpStatusCode.OK);

        } catch (error: any) {
            console.error("Error handling indexes:", error);
            return c.json({
                message: "Pegman server is running",
                details: error.message,
            }, HttpStatusCode.INTERNAL_SERVER_ERROR);
        }
    });

export default router;