interface ParlamentarianListQuerystring {
    itens: number;
    page: number;
    orderby: string;
    order: string;
    id?: number[];
    searchTerm?: string;
    birth_uf?: string;
    party?: string;
}

export type { ParlamentarianListQuerystring };