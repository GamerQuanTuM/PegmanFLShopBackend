import { pgEnum } from "drizzle-orm/pg-core"


export const accountTypeEnum = pgEnum('account_type', [
    "SAVINGS",
    "CURRENT"
])

export const dayOfWeekEnum = pgEnum('day_of_week', [
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
    "SUNDAY"
])


export const orderStatus = pgEnum("order_status", ["PREPARE", "PICKUP", "ON_THE_WAY", "DELIVERED", "CANCELLED"])