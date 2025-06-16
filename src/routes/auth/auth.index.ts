import createRouter from "../../lib/create-app";

import * as handlers from "./auth.handler";
import * as routes from "./auth.route";
import { AppBindings, BaseBindings } from "../../types";

const router = createRouter<BaseBindings>()
    .openapi(routes.generateOtp, handlers.generateOtp)
    .openapi(routes.signup, handlers.signup)
    .openapi(routes.login, handlers.login)
// .openapi(routes.protectedRoute, handlers.protectedRoute)

export const authenticatedRouter = createRouter<AppBindings>()
    .openapi(routes.logout, handlers.logout)
    .openapi(routes.protectedRoute, handlers.protectedRoute)

export default router;