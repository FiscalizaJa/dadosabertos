enum APIErrors {
    auth_user_already_exists = "O usuário já existe no banco de dados.",
    auth_account_not_found = "Conta não encontrada.",
    auth_user_not_found = "Usuário não encontrado.",
    auth_user_not_activated = "A conta do usuário ainda não foi ativada.",
    auth_wrong_password = "Senha incorreta.",
    full_query_invalid_props = "Propriedade(s) inválidas",
    full_query_no_workers_available = "Não há workers disponíveis no momento para processar a sua solicitação. Tente novamente mais tarde.",
    full_query_too_many_queries = "Existe uma consulta sua na fila, por favor aguarde antes de realizar outra.",
    full_query_unhautorized = "Você precisa estar logado para marcar o resultado como visto.",
    full_query_not_found = "Consulta não encontrada.",
    general_unknown_error = "Erro desconhecido."
}

interface FiscalizajaRestErrorData {
    error: APIErrors,
    code: keyof typeof APIErrors,
    targets?: string[]
}

export {
    APIErrors
}

export type {
    FiscalizajaRestErrorData
}