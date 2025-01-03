interface User {
    id: string;
    name: string;
    password: string;
    email: string;
    activated: boolean;
    activation_token?: string;
}

export type { User };