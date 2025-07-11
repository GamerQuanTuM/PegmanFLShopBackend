import * as HttpStatusCode from "stoker/http-status-codes"
import { eq, count } from "drizzle-orm";
import { AppRouteHandler } from "../../types";
import { CreateCategorySchema, DeleteCategorySchema, GetCategoriesSchemaByOutlet, GetCategorySchemaById, UpdateCategorySchema } from "./category.route";
import { db } from "../../db";
import { category, liquor } from "../../db/schema";

export const createCategory: AppRouteHandler<CreateCategorySchema> = async (c) => {
    const { isAvailable, name } = c.req.valid("json")
    const { id } = c.req.valid("param")

    if (!id) {
        return c.json({ message: "Outlet id is required" }, HttpStatusCode.BAD_REQUEST)
    }

    const outletData = await db.query.outlet.findFirst({
        where: (outlet, { eq }) => eq(outlet.id, id)
    })

    if (!outletData) {
        return c.json({ message: "Outlet not found" }, HttpStatusCode.NOT_FOUND);
    }

    const [categoryData] = await db.insert(category).values({
        isAvailable,
        name,
        outletId: outletData.id
    }).returning()

    const response = {
        message: "Category created successfully",
        data: categoryData
    }

    return c.json(response, HttpStatusCode.CREATED);
}

export const getCategoryById: AppRouteHandler<GetCategorySchemaById> = async (c) => {
    const { id } = c.req.valid("param")

    if (!id) {
        return c.json({ message: "Outlet id is required" }, HttpStatusCode.BAD_REQUEST)
    }

    const categoryData = await db.query.category.findFirst({
        where: (category, { eq }) => eq(category.id, id)
    })

    if (!categoryData) {
        return c.json({ message: "Category not found" }, HttpStatusCode.NOT_FOUND);
    }

    const response = {
        message: "Category fetched successfully",
        data: categoryData
    }

    return c.json(response, HttpStatusCode.OK);
}

export const getCategoriesByOutlet: AppRouteHandler<GetCategoriesSchemaByOutlet> = async (c) => {
    const params = c.req.valid("param");
    const query = c.req.valid("query");

    const { id } = params;
    const page = Number(query.page) ?? 1;
    const limit = Number(query.limit) ?? 10;
    const skip = (page - 1) * limit;

    if (!id) {
        return c.json({ message: "Outlet id is required" }, HttpStatusCode.BAD_REQUEST)
    }

    const outletData = await db.query.outlet.findFirst({
        where: (outlet, { eq }) => eq(outlet.id, id)
    })

    if (!outletData) {
        return c.json({ message: "Outlet not found" }, HttpStatusCode.NOT_FOUND);
    }

    // Get total count for pagination
    const [{ count: total }] = await db
        .select({ count: count() })
        .from(category)
        .where(eq(category.outletId, outletData.id));

    // Get paginated results
    const categoriesData = await db.query.category.findMany({
        where: eq(category.outletId, outletData.id),
        limit,
        offset: skip,
        with: {
            liquors: true
        }
    });

    const response = {
        message: "Categories fetched successfully",
        data: categoriesData,
        meta: {
            page,
            limit,
            totalPages: Math.ceil(Number(total) / limit),
            total: Number(total)
        }
    }

    return c.json(response, HttpStatusCode.OK);
}

export const updateCategory: AppRouteHandler<UpdateCategorySchema> = async (c) => {
    const body = c.req.valid("json")
    const params = c.req.valid("param")

    if (!body) {
        return c.json({ message: "Invalid request body" }, HttpStatusCode.BAD_REQUEST)
    }

    if (!params?.id) {
        return c.json({ message: "Category id is required" }, HttpStatusCode.BAD_REQUEST)
    }

    const { isAvailable, name } = body
    const { id } = params

    const existingCategory = await db.query.category.findFirst({
        where: (category, { eq }) => eq(category.id, id)
    })

    if (!existingCategory) {
        return c.json({ message: "Category not found" }, HttpStatusCode.NOT_FOUND);
    }

    const [updatedCategory] = await db
        .update(category)
        .set({
            isAvailable,
            name
        })
        .where(eq(category.id, id))
        .returning();

    const response = {
        message: "Category updated successfully",
        data: updatedCategory
    }

    return c.json(response, HttpStatusCode.OK);
}

export const deleteCategory: AppRouteHandler<DeleteCategorySchema> = async (c) => {
    const params = c.req.valid("param")

    if (!params?.id) {
        return c.json({ message: "Category id is required" }, HttpStatusCode.BAD_REQUEST)
    }

    const { id } = params

    await db.transaction(async (tx) => {
        // Check if the category exists first
        const existingCategory = await tx.query.category.findFirst({
            where: (cat, { eq }) => eq(cat.id, id)
        })

        if (!existingCategory) {
            return c.json({ message: "Category not found" }, HttpStatusCode.NOT_FOUND);
        }

        // Get all liquors in this category
        const liquors = await tx.query.liquor.findMany({
            where: (liquor, { eq }) => eq(liquor.categoryId, id)
        })

        if (liquors.length > 0) {

            // Delete all liquors in this category
            await tx.delete(liquor).where(eq(liquor.categoryId, id))
        }

        // Finally, delete the category
        await tx.delete(category).where(eq(category.id, id))
    })

    return c.json({ message: "Category deleted successfully" }, HttpStatusCode.OK)

}
