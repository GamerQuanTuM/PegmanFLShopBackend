import configureOpenAPI from "./lib/configure-openapi";
import { createApp } from "./lib/create-app";
import sessionMiddleware from "./middlewares/session";
import scheduler from "./helpers/scheduler";
import { cleanupExpiredSessions } from "./helpers/session";
import { timingReset } from "./helpers/outlet";
import healthcheck from "./routes/index.route";
import authRouter, { authenticatedRouter } from "./routes/auth/auth.index";
import outletRouter from "./routes/outlet/outlet.index"
import ownerRouter from "./routes/owner/owner.index"
import categoryRouter from "./routes/category/category.index"
import liquorRouter from "./routes/liquor/liquor.index"
import orderRouter from "./routes/order/order.index"

const app = createApp();

app.use("*", sessionMiddleware)

const routes = [
    healthcheck,
    authRouter,
    authenticatedRouter,
    outletRouter,
    ownerRouter,
    categoryRouter,
    liquorRouter,
    orderRouter
] as const;

routes.forEach((route) => {
    app.route("/", route as any);
})

configureOpenAPI(app as any);

// Cron Jobs
// Reseting every 10 mins
scheduler.scheduleJob("session-cleanup", "*/10 * * * *", cleanupExpiredSessions);

// Reseting every day at midnight 00:00
scheduler.scheduleJob("outlet-timing-reset", "0 0 * * *", timingReset);

export default app;