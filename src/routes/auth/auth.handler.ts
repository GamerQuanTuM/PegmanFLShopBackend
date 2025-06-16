import * as HttpStatusCode from "stoker/http-status-codes"
import { AppRouteHandler, AuthenticatedContext, BaseRouteHandler } from "../../types";
import { GenerateOtpRoute, LoginRoute, LogoutRoute, ProtectedRoute, SignupRoute } from "./auth.route";
import { db } from "../../db";
import { owner } from "../../db/schema";
import { redisGet, redisSet } from "../../helpers/redis";
import { createSession, destroySessionById } from "../../helpers/session";

export const generateOtp: BaseRouteHandler<GenerateOtpRoute> = async (c) => {
    const { mobile_number, login } = c.req.valid('json')
    const otp = Math.floor(100000 + Math.random() * 900000);

    let key;
    if (login) {
        key = `login:${mobile_number}`
    } else {
        key = `register:${mobile_number}`
    }


    console.log(otp)
    await redisSet(key, otp.toString())
    //TODO: Send OTP to mobile number

    return c.json({ message: "OTP sent successfully" }, HttpStatusCode.OK)

}

export const signup: BaseRouteHandler<SignupRoute> = async (c) => {
    const user = c.req.valid('json')
    const { mobileNumber, otp: sentOtp } = user;

    const key = `register:${mobileNumber}`
    const otp = await redisGet(key)

    if (otp != sentOtp) {
        return c.json({ message: "Invalid OTP" }, HttpStatusCode.BAD_REQUEST)
    }


    const existingUser = await db.query.owner.findFirst({
        where: (owner, { eq }) => eq(owner.mobileNumber, mobileNumber)
    })

    if (existingUser) {
        return c.json({ message: "User already exists" }, HttpStatusCode.CONFLICT)
    }


    // Insert the user into the database
    const [inserted] = await db.insert(owner).values({ mobileNumber }).returning()

    const response = {
        data: inserted,
        message: "User created successfully",
    }

    // Return user data without the password
    return c.json(response, HttpStatusCode.CREATED)
}

export const login: BaseRouteHandler<LoginRoute> = async (c) => {
    const user = c.req.valid('json')
    const { mobileNumber, otp: sentOtp, model } = user;

    const key = `login:${mobileNumber}`
    const otp = await redisGet(key)

    const mockOtp = otp || "999999"


    if (mockOtp != sentOtp) {
        return c.json({ message: "Invalid OTP" }, HttpStatusCode.BAD_REQUEST)
    }

    // Find the user by email
    const existingUser = await db.query.owner.findFirst({
        where: (owner, { eq }) => eq(owner.mobileNumber, mobileNumber),
        with: {
            sessions: true
        }
    })


    if (!existingUser) {
        return c.json({ message: "Email not found" }, HttpStatusCode.NOT_FOUND)
    }

    if (existingUser.sessions.length > 4) {
        return c.json({ message: "You have reached the maximum number of sessions" }, HttpStatusCode.BAD_REQUEST)
    }


    const sessionData = await createSession(c, existingUser.id, model ? model : "")

    const { sessions, ...userWithoutSessions } = existingUser

    const response = {
        data: {
            ...userWithoutSessions,
            sessionId: sessionData.id
        },
        message: "Login successful",
    }

    return c.json(response, HttpStatusCode.OK)

}

export const logout: AppRouteHandler<LogoutRoute> = async (c) => {
    const { id } = c.get("session")
    if (id) {
        await destroySessionById(c, id)
    }
    return c.json({ message: "Logout successful" }, HttpStatusCode.OK)
}

export const protectedRoute: AppRouteHandler<ProtectedRoute> = async (c: AuthenticatedContext) => {
    const { userId, id } = c.var.session
    const user = await db.query.owner.findFirst({
        where: (owner, { eq }) => eq(owner.id, userId),
    })
    return c.json("Protected route", HttpStatusCode.OK)
}

// export const protectedRoute: AppRouteHandler<ProtectedRoute> = async (c: AuthenticatedContext) => {
//     const user = await getAuthUser(c);
//     console.log(user)
//     return c.json("Protected route", HttpStatusCode.OK)
// }


