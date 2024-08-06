/**
 * Ordena um objeto em que todos os valore são números, do maior para o menor.
 * @param object Objeto a ser ordenado
 */
function buildRankObject(object: object) {
    const newObj = []
    
    const entries = Object.entries(object)
    const sorted_entries = entries.sort((a, b) => b[1] - a[1])

    for(const entry of sorted_entries) {
        newObj.push({ deputy_id: entry[0], spend: entry[1] })
    }

    return newObj
}

export default buildRankObject