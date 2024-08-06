/**
 * Divide o array em chunks simples.
 * Não recomendado para arrays grandes (Alto uso de memória), para outros casos, use o paginate.
 * @param arr Array que será dividido em chunks
 * @param size Tamanho de cada chunk
*/
function simpleChunk(arr: any[], size: number) {
    return Array.from({ length: Math.ceil(arr.length / size) }, (v, i) => arr.slice(i * size, i * size + size));
}

export default simpleChunk