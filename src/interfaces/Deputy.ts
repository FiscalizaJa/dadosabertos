interface Deputy {
    id: number;
    name: string;
    full_name: string;
    sex: string;
    party?: string;
    cpf?: string;
    birth_date: string;
    birth_uf: string;
}

interface DeputyOffice {
    name: string;
    building: string;
    room: string;
    floor: string;
    phone: string;
    email: string;
}

interface DeputyLinks {
    url: string;
    type: string;
}

export type { Deputy, DeputyOffice, DeputyLinks };