import { z } from "zod";
import userSchema from "./User";

const GPTMessageSchema = z.object({
    author: userSchema.UserSchema,
    content: z.string().max(3000)
})

const GPTFunctionMetaSchema = z.object({
    house: z.enum(["senado", "camara"])
})

type GPTMessage = z.infer<typeof GPTMessageSchema>
type GPTFunctionMeta = z.infer<typeof GPTFunctionMetaSchema>

export type {
    GPTMessage,
    GPTFunctionMeta
}

export default {
    GPTMessageSchema
}