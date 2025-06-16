import * as HttpStatusCode from "stoker/http-status-codes"
import { eq } from "drizzle-orm";
import { AppRouteHandler } from "../../types";
import { CreateCategorySchema, DeleteCategorySchema, GetCategorySchemaById, UpdateCategorySchema } from "./category.route";
import { db } from "../../db";
import { category } from "../../db/schema";

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
        is_available: isAvailable,
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
            is_available: isAvailable,
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

    // Check if the category exists first
    const existingCategory = await db.query.category.findFirst({
        where: (cat, { eq }) => eq(cat.id, id)
    })

    if (!existingCategory) {
        return c.json({ message: "Category not found" }, HttpStatusCode.NOT_FOUND);
    }

    // Delete the category
    await db
        .delete(category)
        .where(eq(category.id, id));

    return c.json({ message: "Category deleted successfully" }, HttpStatusCode.OK);
}
