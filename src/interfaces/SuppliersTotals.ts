import { z } from "zod";

const SuppliersTotalsSchema = z.object({
    deputy_id: z.number().optional(),
    month: z.number().min(1).max(12).array()
})

type SuppliersTotals = z.infer<typeof SuppliersTotalsSchema>

export type {
    SuppliersTotals
}

export default SuppliersTotalsSchema
// esse tipo pode ser usado tanto para o Senado, quanto para a Câmara dos deputados.
// campos adicionais ficarão em um tipo separado que será feito uma Union com esse.