/**
 * Transform empty strings in object into null.
 * Transforma strings vazias em um objeto para null. Muitos valores são uma string vazia ao invés de null (até quando o campo é numérico. Isso é um problema se não validado.)
 */

export default function nullishEmptyString(object: any) {
    const keys = Object.keys(object)

    for(const key of keys) {
        const value = object[key]
        if(typeof value === "object") {
            object[key] = nullishEmptyString(value) // recursividade omaga
        } else {
            object[key] = typeof value === "string" && value.length === 0 ? null : value
        }
    }

    return object
}