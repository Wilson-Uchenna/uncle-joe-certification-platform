import { customSessionClient, emailOTPClient } from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react" // make sure to import from better-auth/react
import { auth } from "./auth"

export const authClient =  createAuthClient({
    //you can pass client configuration here

    baseURL: process.env.BETTER_AUTH_URL,
    plugins: [
        emailOTPClient(),
        customSessionClient<typeof auth>()
    ]
})