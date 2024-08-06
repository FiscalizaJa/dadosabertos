import { z } from "zod";

const FullQuerySchema = z.object({
    operator: z.enum(["AND", "OR"]),
    value: z.string().max(50),
    property: z.enum(["liquid_value"]),
}).array()

type FullQuery = z.infer<typeof FullQuerySchema>

export default FullQuerySchema
export type { FullQuery }