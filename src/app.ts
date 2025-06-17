import configureOpenAPI from "./lib/configure-openapi";
import { createApp } from "./lib/create-app";
import sessionMiddleware from "./middlewares/session";
import scheduler from "./helpers/scheduler";
import { cleanupExpiredSessions } from "./helpers/session";
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
scheduler.scheduleJob("session-cleanup", "*/10 * * * *", cleanupExpiredSessions);

export default app;