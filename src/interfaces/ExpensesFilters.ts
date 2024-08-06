import { z } from "zod";

const currentDate = new Date()

const ExpensesFiltersSchema = z.object({
    year: z.number().max(currentDate.getFullYear()).array(),
    month: z.number().min(1).max(12).array(),
    supplier: z.string(),
    page: z.number().min(1),
    itens: z.number().max(100),
    orderby: z.string().optional(),
    order: z.string().optional()
})

type ExpensesFilters = z.infer<typeof ExpensesFiltersSchema>

export default ExpensesFiltersSchema

export type {
    ExpensesFilters
}

// esse tipo pode ser usado tanto para o Senado, quanto para a Câmara dos deputados.
// campos adicionais ficarão em um tipo separado que será feito uma Union com esse.