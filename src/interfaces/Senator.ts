import { z } from "zod";

const SenatorSchema = z.object({
    id: z.number(),
    name: z.string(),
    full_name: z.string(),
    sex: z.string().max(1),
    party: z.string().optional(),
    cpf: z.string().optional(),
    birth_date: z.string(),
    birth_uf: z.string(), // string, porque a base de dados do senado tem muitas datas inválidas ):
    alternate_type: z.number().optional(),
    holder_id: z.number().optional()
})

const SenatorOfficeSchema = z.object({
    phone: z.string(),
    address: z.string(),
    email: z.string().email()
})

type Senator = z.infer<typeof SenatorSchema>
type SenatorOffice = z.infer<typeof SenatorOfficeSchema>

export type { Senator, SenatorOffice }
export default {
    SenatorSchema,
    SenatorOfficeSchema
}