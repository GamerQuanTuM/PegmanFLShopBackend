import type { OpenAPIHono, RouteConfig, RouteHandler } from "@hono/zod-openapi";
import { Context } from "hono";
import { PinoLogger } from "hono-pino";

// Define your application bindings
export type AppBindings = {
    Variables: {
        session: {
            id: string;
            userId: string
        },
        logger: PinoLogger;
    }
}

export type BaseBindings = {
    Variables: {
        logger: PinoLogger;
    }
}

// Define your application's OpenAPI type
export type BaseOpenAPI = OpenAPIHono<BaseBindings>
export type AppOpenAPI = OpenAPIHono<AppBindings>

// Define an authenticated context type
export type AuthenticatedContext = Context<AppBindings>

// Define a type for your route handlers
export type AppRouteHandler<R extends RouteConfig> = RouteHandler<R, AppBindings>

export type BaseRouteHandler<R extends RouteConfig> = RouteHandler<R, BaseBindings>