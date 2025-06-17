import createRouter from "../../lib/create-app";
import { AppBindings } from "../../types";
import * as handler from "./liquor.handler";
import * as routes from "./liquor.route";

const router = createRouter<AppBindings>()
    .openapi(routes.createLiquor, handler.createLiquor)
    .openapi(routes.getLiquorById, handler.getLiquorById)
    .openapi(routes.getLiquorsOfCategory, handler.getLiquorsOfCategory)
    .openapi(routes.updateLiquor, handler.updateLiquor)
    .openapi(routes.deleteLiquor, handler.deleteLiquor)

export default router