import { z } from "zod";

const DeputySchema = z.object({
    id: z.number(),
    name: z.string(),
    full_name: z.string(),
    sex: z.string().max(1),
    party: z.string().optional(),
    cpf: z.string().optional(),
    birth_date: z.string(),
    birth_uf: z.string() // string, porque a base de dados da câmara tem muitas datas inválidas ):
})

const DeputyOfficeSchema = z.object({
    name: z.string(),
    building: z.string(),
    room: z.string(),
    floor: z.string(),
    phone: z.string(),
    email: z.string().email()
})

const DeputyLinksSchema = z.object({
    url: z.string().url(),
    type: z.string()
})

type Deputy = z.infer<typeof DeputySchema>
type DeputyOffice = z.infer<typeof DeputyOfficeSchema>
type DeputyLinks = z.infer<typeof DeputyLinksSchema>

export type { Deputy, DeputyOffice , DeputyLinks}
export default {
    DeputySchema,
    DeputyOfficeSchema,
    DeputyLinksSchema
}