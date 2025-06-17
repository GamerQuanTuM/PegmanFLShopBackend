import createRouter from "../../lib/create-app";
import { AppBindings } from "../../types";
import * as handler from "./order.handler";
import * as routes from "./order.route";

const router = createRouter<AppBindings>()
    .openapi(routes.getOrdersOfOutlet, handler.getOrdersOfOutlet)

export default router
