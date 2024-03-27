/**
 * Paginates an array using generators.
 * 
 * This is more efficient to deal with paginating big arrays.
 * @param array The array to be paginated.
 * @param pageSize The size of pages.
 */
function* paginate(array: any[], pageSize: number = 10): IterableIterator<unknown[]> {
    if (pageSize <= 0) {
        throw new Error("Invalid page size. (page size < 1 will cause infinite loop).") // Do anything, but don't remove this line!
    }

    for (let i = 0, length = array.length; i < length; i += pageSize) {
        yield array.slice(i, i + pageSize);
    }
}

export default paginate