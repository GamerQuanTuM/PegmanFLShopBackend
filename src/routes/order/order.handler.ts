import * as HttpStatusCode from "stoker/http-status-codes"
import { AppRouteHandler } from "../../types";
import { db } from "../../db";
import { GetOrdersSchema, GetOutletByIdSchema } from "./order.route"
import { order } from "../../db/schema";
import { and, asc, desc, eq, gte, ilike, lte, or, count } from "drizzle-orm";
import { orderStatus } from "../../db/schema/enums";


export const getOrdersOfOutlet: AppRouteHandler<GetOrdersSchema> = async (c) => {
    const params = c.req.valid("param")
    const query = c.req.valid("query")

    const page = parseInt(query.page ?? "1");
    const limit = parseInt(query.limit ?? "10");
    const skip = (page - 1) * limit;

    const filters = [];

    if (query.status) {
        if (orderStatus.enumValues.includes(query.status)) {
            filters.push(eq(order.status, query.status));
        }
    }

    if (query.minPrice) {
        filters.push(gte(order.price, parseFloat(query.minPrice)));
    }

    if (query.maxPrice) {
        filters.push(lte(order.price, parseFloat(query.maxPrice)));
    }

    if (query.from) {
        filters.push(gte(order.createdAt, new Date(query.from)));
    }

    if (query.to) {
        filters.push(lte(order.createdAt, new Date(query.to)));
    }

    if (query.search) {
        filters.push(or(
            ilike(order.status, `%${query.search}%`),
            ilike(order.userId, `%${query.search}%`),
        ));
    }

    const sortField = query.sortBy ?? "createdAt";
    const sortOrder = query.sortOrder === "desc" ? "desc" : "asc";

    const [{ count: total }] = await db
        .select({ count: count() })
        .from(order)
        .where(and(...filters));

    const result = await db.query.order.findMany({
        where: and(
            eq(order.outletId, params.id),
            ...filters
        ),
        orderBy: (order) =>
            sortOrder === "asc"
                ? asc(order[sortField])
                : desc(order[sortField]),
        limit,
        offset: skip,
        with: {
            orderItems: true
        }
    });

    const response = {
        message: "Order fetched successfully",
        data: result,
        page,
        limit,
        totalPages: Math.ceil(Number(total) / limit),
        total: Number(total)
    }

    return c.json(response, HttpStatusCode.OK)
}

export const getOrderById: AppRouteHandler<GetOutletByIdSchema> = async (c) => {
    const params = c.req.valid("param")
    const orderData = await db.query.order.findFirst({
        where: eq(order.id, params.id),
        with: {
            orderItems: true
        }
    })
    if (!orderData) {
        return c.json({ message: "Order not found" }, HttpStatusCode.NOT_FOUND)
    }

    const response = {
        message: "Order fetched successfully",
        data: orderData
    }
    return c.json(response, HttpStatusCode.OK)
}
