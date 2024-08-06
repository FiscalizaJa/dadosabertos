import { z } from "zod"

const currentDate = new Date()

const ExpenseResumeFilterSchema = z.object({
    year: z.number().max(currentDate.getFullYear()).array(),
    month: z.number().min(1).max(12).array()
})

type ExpensesResumeFilter = z.infer<typeof ExpenseResumeFilterSchema>

export type {
    ExpensesResumeFilter
}
export default ExpenseResumeFilterSchema
// esse tipo pode ser usado tanto para o Senado, quanto para a Câmara dos deputados.
// campos adicionais ficarão em um tipo separado que será feito uma Union com esse.