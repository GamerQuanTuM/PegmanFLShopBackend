import * as HttpStatusCode from "stoker/http-status-codes"
import { and, asc, desc, eq, gte, ilike, lte, count } from "drizzle-orm";
import { AppRouteHandler } from "../../types";
import { CreateLiquorSchema, DeleteLiquorSchema, GetLiquorSchemaById, UpdateLiquorSchema, GetLiquorsOfCategorySchema } from "./liquor.route";
import { db } from "../../db";
import { liquor } from "../../db/schema";
import { uploadFiles } from "../../lib/storage";

export const createLiquor: AppRouteHandler<CreateLiquorSchema> = async (c) => {
    const { image, name, description, quantity, price, inStock } = c.req.valid("form")

    const { id } = c.req.valid("param")

    let image_url = ""

    if (image) {
        const [url] = await uploadFiles([image])
        image_url = url
    }

    // Validate category exists if categoryId is provided
    if (id) {
        const categoryData = await db.query.category.findFirst({
            where: (cat, { eq }) => eq(cat.id, id)
        })

        if (!categoryData) {
            return c.json({ message: "Category not found" }, HttpStatusCode.NOT_FOUND);
        }
    }

    const [liquorData] = await db.insert(liquor).values({
        categoryId: id,
        image: image_url,
        name,
        description,
        quantity: Number(quantity),
        price: Number(price),
        inStock: Boolean(inStock)
    }).returning()

    const response = {
        message: "Liquor created successfully",
        data: liquorData
    }

    return c.json(response, HttpStatusCode.CREATED);
}

export const getLiquorById: AppRouteHandler<GetLiquorSchemaById> = async (c) => {
    const { id } = c.req.valid("param")

    if (!id) {
        return c.json({ message: "Liquor id is required" }, HttpStatusCode.BAD_REQUEST)
    }

    const liquorData = await db.query.liquor.findFirst({
        where: (liq, { eq }) => eq(liq.id, id),
        with: {
            category: true
        }
    })

    if (!liquorData) {
        return c.json({ message: "Liquor not found" }, HttpStatusCode.NOT_FOUND);
    }

    const response = {
        message: "Liquor fetched successfully",
        data: liquorData
    }

    return c.json(response, HttpStatusCode.OK);
}

export const updateLiquor: AppRouteHandler<UpdateLiquorSchema> = async (c) => {
    const body = c.req.valid("form")
    const params = c.req.valid("param")

    if (!body) {
        return c.json({ message: "Invalid request body" }, HttpStatusCode.BAD_REQUEST)
    }

    if (!params?.id) {
        return c.json({ message: "Liquor id is required" }, HttpStatusCode.BAD_REQUEST)
    }

    const { image, name, description, quantity, price, inStock } = body
    const { id } = params

    let image_url = ""

    if (image) {
        const [url] = await uploadFiles([image])
        image_url = url
    }


    // Check if liquor exists
    const existingLiquor = await db.query.liquor.findFirst({
        where: (liq, { eq }) => eq(liq.id, id)
    })

    if (!existingLiquor) {
        return c.json({ message: "Liquor not found" }, HttpStatusCode.NOT_FOUND);
    }

    const [updatedLiquor] = await db
        .update(liquor)
        .set({
            image: image_url,
            name,
            description,
            quantity,
            price,
            inStock
        })
        .where(eq(liquor.id, id))
        .returning();

    const response = {
        message: "Liquor updated successfully",
        data: updatedLiquor
    }

    return c.json(response, HttpStatusCode.OK);
}

export const deleteLiquor: AppRouteHandler<DeleteLiquorSchema> = async (c) => {
    const params = c.req.valid("param")

    if (!params?.id) {
        return c.json({ message: "Liquor id is required" }, HttpStatusCode.BAD_REQUEST)
    }

    const { id } = params

    // Check if the liquor exists first
    const existingLiquor = await db.query.liquor.findFirst({
        where: (liq, { eq }) => eq(liq.id, id)
    })

    if (!existingLiquor) {
        return c.json({ message: "Liquor not found" }, HttpStatusCode.NOT_FOUND);
    }

    // Delete the liquor
    await db
        .delete(liquor)
        .where(eq(liquor.id, id));

    return c.json({ message: "Liquor deleted successfully" }, HttpStatusCode.OK);
}

export const getLiquorsOfCategory: AppRouteHandler<GetLiquorsOfCategorySchema> = async (c) => {
    const params = c.req.valid("param");
    const query = c.req.valid("query");
    
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    // ✅ Check if category exists
    const categoryData = await db.query.category.findFirst({
        where: (cat, { eq }) => eq(cat.id, params.id),
    });

    if (!categoryData) {
        return c.json({ message: "Category not found" }, HttpStatusCode.NOT_FOUND);
    }

    const filters = [eq(liquor.categoryId, params.id)];

    if (query.name) {
        filters.push(ilike(liquor.name, `%${query.name}%`));
    }

    if (query.inStock) {
        filters.push(eq(liquor.inStock, query.inStock === "true"));
    }

    const sortField = query.sortBy ?? "createdAt";
    const sortOrder = query.sortOrder === "desc" ? "desc" : "asc";

    const [{ count: total }] = await db
        .select({ count: count() })
        .from(liquor)
        .where(and(...filters));

    const result = await db.query.liquor.findMany({
        where: and(...filters),
        orderBy: (liquor) =>
            sortOrder === "asc"
                ? asc(liquor[sortField])
                : desc(liquor[sortField]),
        limit,
        offset: skip,
    });

    const response = {
        message: "Liquors fetched successfully",
        data: result,
        page,
        limit,
        totalPages: Math.ceil(Number(total) / limit),
        total: Number(total)
    };

    return c.json(response, HttpStatusCode.OK);
};

