

import { AppBindings } from "../types"
import { MiddlewareHandler } from "hono"
import { createMiddleware } from "hono/factory"

const protect: MiddlewareHandler<AppBindings> = createMiddleware(async (c, next) => {
    const sessionData = c.get('session')

    if (!sessionData || !sessionData.id) {
        return c.json({ error: 'Unauthorized' }, 401)
    }

    await next()
})

export default protect