import { eq } from "drizzle-orm";
import { db } from "../db";
import { outletTiming } from "../db/schema";

export const timingReset = async () => {
    try {
        const outletTimingData = await db.update(outletTiming).set({ isOpen: true }).where(eq(outletTiming.isOpen, false)).returning();

        if (outletTimingData) {
            console.log("Outlet timing reset successfully")
        }
    } catch (err) {
        console.log("Error in timingReset", err)
    }

}