export const toMap = function <T, K, V>(array: T[], keySelector: (item: T, index: string) => K, valueSelector: (item: T, index: string) => V) {
    let res = new Map<K, V>();
    for (let i in array) {
        res.set(keySelector(array[i], i), valueSelector(array[i], i));
    }
    return res;
};

export const IndexKeySelector = function <T>(_: T, index: string) { return index };