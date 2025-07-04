import * as HttpStatusCode from "stoker/http-status-codes"
import { and, asc, desc, eq, gte, ilike, lte, or, count, inArray, sql } from "drizzle-orm";
import { AppRouteHandler } from "../../types";
import { db } from "../../db";
import { GetOrdersSchema, GetOutletByIdSchema } from "./order.route"
import { order, orderItem } from "../../db/schema";
import { orderStatus } from "../../db/schema/enums";


export const getOrdersOfOutlet: AppRouteHandler<GetOrdersSchema> = async (c) => {
    const params = c.req.valid("param")
    const query = c.req.valid("query")

    const page = query.page ? parseInt(query.page) : 1;
    const limit = query.limit ? parseInt(query.limit) : 10;
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
        const searchFilters = [];
        // UUID pattern matching - checks if search looks like part of a UUID
        const uuidPartPattern = /^[0-9a-f-]+$/i;
        const looksLikeUuidPart = uuidPartPattern.test(query.search);

        if (looksLikeUuidPart) {
            // For UUID parts, we want to match segments anywhere in the UUID
            const segments = query.search.split('-').filter(Boolean);

            if (segments.length > 0) {
                // Method 1: Simple substring matching (most flexible)
                const searchPattern = `%${query.search}%`;
                searchFilters.push(sql`${order.id}::text ilike ${searchPattern}`);
                searchFilters.push(sql`${order.userId}::text ilike ${searchPattern}`);

                // Method 2: Strict segment boundary matching (more precise)
                // This ensures we match complete segments in the correct order
                const segmentPattern = segments.map(s => `${s}`).join('-');
                const boundaryPattern = `%-${segmentPattern}-%`;
                const prefixPattern = `${segmentPattern}-%`;
                const suffixPattern = `%-${segmentPattern}`;

                searchFilters.push(sql`${order.id}::text ilike ${boundaryPattern}`);
                searchFilters.push(sql`${order.id}::text ilike ${prefixPattern}`);
                searchFilters.push(sql`${order.id}::text ilike ${suffixPattern}`);
                searchFilters.push(sql`${order.userId}::text ilike ${boundaryPattern}`);
                searchFilters.push(sql`${order.userId}::text ilike ${prefixPattern}`);
                searchFilters.push(sql`${order.userId}::text ilike ${suffixPattern}`);
            }

            // For complete UUIDs, add exact match
            if (query.search.length === 36) {
                searchFilters.push(eq(order.id, query.search));
                searchFilters.push(eq(order.userId, query.search));
            }
        }

        // Liquor name search (unchanged)
        const ordersWithMatchingItems = await db
            .select({ orderId: orderItem.orderId })
            .from(orderItem)
            .where(ilike(orderItem.liquorName, `%${query.search}%`));

        const orderIds = ordersWithMatchingItems.map(item => item.orderId).filter(Boolean) as string[];

        if (orderIds.length > 0) {
            searchFilters.push(inArray(order.id, orderIds));
        }

        if (searchFilters.length > 0) {
            filters.push(or(...searchFilters));
        }
    }

    const sortField = query.sortBy ?? "createdAt";
    const sortOrder = query.sortOrder === "desc" ? "desc" : "asc";

    const [{ count: total }] = await db
        .select({ count: count() })
        .from(order)
        .where(and(
            eq(order.outletId, params.id),
            ...filters
        ));

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
    console.log(params)
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
