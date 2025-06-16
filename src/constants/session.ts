type Session = {
    name: string;
    maxAge: number;
    httpOnly: boolean;
    secure: boolean;
    sameSite: "Strict" | "strict" | "Lax" | "None" | "lax" | "none" | undefined
}

export const SESSION_CONFIG = {
    name: 'sessionId',
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
    // @ts-ignore
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict'
} as Session

