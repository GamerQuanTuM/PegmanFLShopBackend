import createRouter from "../../lib/create-app";
import { AppBindings } from "../../types";
import * as handler from "./category.handler";
import * as routes from "./category.route";

const router = createRouter<AppBindings>()
    .openapi(routes.createCategory, handler.createCategory)
    .openapi(routes.getCategoryById, handler.getCategoryById)
    .openapi(routes.getCategoriesOfOutlet, handler.getCategoriesByOutlet)
    .openapi(routes.updateCategory, handler.updateCategory)
    .openapi(routes.deleteCategory, handler.deleteCategory)

export default router