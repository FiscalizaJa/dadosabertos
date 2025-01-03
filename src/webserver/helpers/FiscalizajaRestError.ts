import { APIErrors } from "../enums/APIErrors";
import type { FiscalizajaRestErrorData } from "../enums/APIErrors";

function FiscalizajaRestError(code: APIErrors, targets?: string[]): FiscalizajaRestErrorData {
    return {
        code: APIErrors[code],
        error: code,
        targets: targets
    }
}

export default FiscalizajaRestError