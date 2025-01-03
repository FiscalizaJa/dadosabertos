interface ExpensesFilters {
    year: number[]
    month: number[]
    supplier: string
    page: number
    itens: number
    orderby?: string
    order?: string
}

export type { ExpensesFilters }