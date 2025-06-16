import { and, eq, gt, lte } from "drizzle-orm"
import { deleteCookie, setCookie } from "hono/cookie"
import { db } from "../db"
import { SESSION_CONFIG } from "../constants/session"
import { session } from "../db/schema"
import { AuthenticatedContext } from "../types"
import { Context } from "hono"

// Updated createSession function that works for login (no existing session required)
async function createSession(c: Context, ownerId: string, model?: string) {
    const expiresAt = new Date(Date.now() + SESSION_CONFIG.maxAge)

    try {
        // Insert session into database
        const [newSession] = await db.insert(session).values({
            ownerId,
            expiresAt,
            model,
        }).returning()

        // Set cookie
        setCookie(c, SESSION_CONFIG.name, newSession.id, {
            httpOnly: SESSION_CONFIG.httpOnly,
            secure: SESSION_CONFIG.secure,
            sameSite: SESSION_CONFIG.sameSite,
            maxAge: Math.floor(SESSION_CONFIG.maxAge / 1000)
        })

        return newSession
    } catch (error) {
        console.error('Error creating session:', error)
        throw new Error('Failed to create session')
    }
}

// Keep the existing destroySession for authenticated contexts
async function destroySession(c: AuthenticatedContext) {
    const sessionData = c.get('session')

    if (sessionData?.id) {
        try {
            // Delete from database
            await db.delete(session).where(eq(session.id, sessionData.id))
        } catch (error) {
            console.error('Error destroying session:', error)
        }
    }

    deleteCookie(c, SESSION_CONFIG.name)
}

// Alternative destroy function that works with session ID
async function destroySessionById(c: Context | AuthenticatedContext, sessionId: string) {
    if (sessionId) {
        try {
            // Delete from database
            await db.delete(session).where(eq(session.id, sessionId))
        } catch (error) {
            console.error('Error destroying session:', error)
        }
    }

    deleteCookie(c, SESSION_CONFIG.name)
}

async function cleanupExpiredSessions() {
    try {
        const result = await db.delete(session)
            .where(lte(session.expiresAt, new Date()))
        console.log(`Cleaned up ${result.rowCount} expired sessions`)
    } catch (error) {
        console.error('Error cleaning up sessions:', error)
    }
}

async function getUserSessions(ownerId: string) {
    return await db.query.session.findMany({
        where: and(
            eq(session.ownerId, ownerId),
            gt(session.expiresAt, new Date())
        ),
        orderBy: session.createdAt
    })
}

async function destroyAllUserSessions(ownerId: string) {
    try {
        const result = await db.delete(session)
            .where(eq(session.ownerId, ownerId))

        return result.rowCount
    } catch (error) {
        console.error('Error destroying user sessions:', error)
        throw new Error('Failed to destroy sessions')
    }
}

export {
    createSession,
    destroySession,
    destroySessionById,
    cleanupExpiredSessions,
    getUserSessions,
    destroyAllUserSessions
}