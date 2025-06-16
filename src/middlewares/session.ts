import { and, eq, gt } from 'drizzle-orm'
import { getCookie, deleteCookie } from 'hono/cookie'
import { createMiddleware } from 'hono/factory'
import { SESSION_CONFIG } from '../constants/session'
import { db } from '../db'
import { session } from '../db/schema'

const sessionMiddleware = createMiddleware(async (c, next) => {

    const sessionId = getCookie(c, SESSION_CONFIG.name)

    if (sessionId) {
        try {
            // Find session in database
            const sessionData = await db.query.session.findFirst({
                where: and(
                    eq(session.id, sessionId),
                    gt(session.expiresAt, new Date())
                ),
                with: {
                    owner: true
                }
            })

            if (sessionData) {
                // Session is valid and not expired
                c.set('session', {
                    id: sessionData.id,
                    userId: sessionData.ownerId
                })

                // Optional: Update last accessed time
                await db.update(session)
                    .set({ updatedAt: new Date() })
                    .where(eq(session.id, sessionId))
            } else {
                // Session not found or expired, clean up cookie
                deleteCookie(c, SESSION_CONFIG.name)
            }
        } catch (error) {
            console.error('Session middleware error:', error)
            deleteCookie(c, SESSION_CONFIG.name)
        }
    }

    await next()
})

export default sessionMiddleware