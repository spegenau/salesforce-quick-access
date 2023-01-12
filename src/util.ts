export function ARR_REDUCE<T>(previous: T[], current: T[]): T[] {
    return previous.concat(current);
}