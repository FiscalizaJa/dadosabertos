interface Senator {
    id: number;
    name: string;
    full_name: string;
    sex: string;
    party?: string;
    cpf?: string;
    birth_date: string;
    birth_uf: string;
    alternate_type?: number;
    holder_id?: number;
}

interface SenatorOffice {
    phone: string;
    address: string;
    email: string;
}

export type { Senator, SenatorOffice };