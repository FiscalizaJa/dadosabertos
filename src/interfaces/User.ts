import { z } from "zod";

const UserSchema = z.object({
    id: z.string(),
    name: z.string(),
    email: z.string().email(),
    avatar_url: z.string().url()
}).required()

type User = z.infer<typeof UserSchema>

export type {
    User
}

export default {
    UserSchema
}