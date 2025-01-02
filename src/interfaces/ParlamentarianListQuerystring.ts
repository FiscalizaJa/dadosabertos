import { z } from "zod";

const ParlamentarianListQuerystringSchema = z.object({
    itens: z.number().max(100),
    page: z.number().min(1),
    orderby: z.string(),
    order: z.string(),
    id: z.array(z.number().int().optional()),
    searchTerm: z.string().max(100),
    birth_uf: z.string().max(5),
    party: z.string().max(100)
})

type ParlamentarianListQuerystring = z.infer<typeof ParlamentarianListQuerystringSchema>

export type {
    ParlamentarianListQuerystring
}

export default ParlamentarianListQuerystringSchema
// esse tipo pode ser usado tanto para o Senado, quanto para a Câmara dos deputados.
// campos adicionais ficarão em um tipo separado que será feito uma Union com esse.