/**
 * @remarks {@link isFalsy isFalsy()} checks if a given value is falsy
 *
 * @param {unknown} value The value to check
 *
 * @returns boolean
 *
 * @example
 *
 * ```ts
 * isFalsy(null); // true
 * isFalsy(undefined); // true
 * isFalsy(0); // true
 * isFalsy(false); // true
 * isFalsy(''); // true
 * isFalsy(NaN); // true
 * isFalsy(true); // false
 * ```
 */
export const isFalsy = (
    value: unknown,
): value is boolean | null | number | string | typeof Number.NaN => !value;

/**
 * @remarks {@link isEmptyCollection isEmptyCollection()} checks if a collection is empty
 *
 * @param {unknown} value The value to check
 *
 * @returns boolean
 *
 * @example
 *
 * ```ts
 * isEmptyCollection([]); // true
 * isEmptyCollection({}); // true
 * isEmptyCollection([1]); // false
 * isEmptyCollection({a: 'b'}); //false
 * ```
 */
export const isEmptyCollection = (value: unknown) =>
    (Array.isArray(value) || value === Object(value)) &&
    !(value instanceof Date) &&
    !(value instanceof Set) &&
    !(value instanceof Map) &&
    Object.keys(value as Array<unknown> | Record<string, unknown>).length === 0;

/**
 * @remarks {@link isString isString()} checks if the value is a string.
 *
 * @param {unknown} value The value to check
 *
 * @returns boolean
 *
 * @example
 *
 * ```ts
 * isString(''); // true
 * isString(' '); // true
 * isString('\t\n\r'); // true
 * isString('hello'); // true
 * isString('hello there'); // true
 * isString(null); // false
 * isString({ ... }); // false
 * isString([ ... ]); // false
 * ```
 */

export const isString = (value: unknown): value is string =>
    typeof value === 'string' || value instanceof String

/**
 * @remarks {@link isWhitespaceString isWhitespaceString()} checks if a string is only whitespace
 *
 * @param {unknown} value The value to check
 *
 * @returns boolean
 *
 * @example
 *
 * ```ts
 * isWhitespaceString(' '); // true
 * isWhitespaceString('\t\n\r'); // true
 * isWhitespaceString('hello'); // false
 * ```
 */
export const isWhitespaceString = (value: unknown): value is string =>
    typeof value === 'string' && /^\s*$/.test(value);

/**
 * @remarks {@link isZeroLengthString isZeroLengthString()} checks if a string is zero length
 * @param {unknown} value The value to check
 * @returns boolean
 *
 * @example
 *
 * ```ts
 * isZeroLengthString(''); // true
 * isZeroLengthString(' '); // false
 * isZeroLengthString('hello'); // false
 * ````
 */
export const isZeroLengthString = (value: unknown): value is string =>
    typeof value === 'string' && value.length === 0;

/**
 * @remarks {@link isInvalidDate isInvalidDate()} checks if an object is an invalid Date
 *
 * @param {unknown} value The value to check
 *
 * @returns boolean
 *
 * @example
 *
 * ```ts
 * isInvalidDate(new Date('hello')); // true
 * isInvalidDate(new Date()); // false
 * ```
 */
export const isInvalidDate = (value: unknown): value is Date =>
    value instanceof Date && Number.isNaN(value.getTime());

/**
 * @remarks {@link isEmptySet isEmptySet()} checks if an object is an empty Set
 *
 * @param {unknown} value The value to check
 *
 * @returns boolean
 *
 * @example
 *
 * ```ts
 * isEmptySet(new Set()); // true
 * isEmptySet(new Set([1])); // false
 * ```
 */
export const isEmptySet = <T = unknown>(value: unknown): value is Set<T> =>
    value instanceof Set && value.size === 0;

/**
 * @remarks {@link isEmptyMap isEmptyMap()} checks if an object is an empty Map
 *
 * @param {unknown} value The value to check
 *
 * @returns boolean
 *
 * @example
 *
 * ```ts
 * isEmptyMap(new Map()); // true
 * isEmptyMap(new Map([[1, 'one']])); //false
 * ```
 */
export const isEmptyMap = <K = unknown, V = unknown>(
    value: unknown,
): value is Map<K, V> => value instanceof Map && value.size === 0;

/**
 * @remarks {@link isBlank isBlank()} checks if a value is 'blank'
 *
 * @param {unknown} value The value to check
 *
 * @returns boolean
 *
 * @example
 *
 * ```ts
 * isBlank(null); // true
 * isBlank(undefined); // true
 * isBlank(0); // true
 * isBlank(false); // true
 * isBlank(''); // true
 * isBlank(' \r\n'); //true
 * isBlank(NaN); // true
 * isBlank([]); // true
 * isBlank({}); // true
 * isBlank(new Date('hello')); // true
 * isBlank(new Set()); // true
 * isBlank(new Map()); // true
 * ```
 */
export const isBlank = <T = unknown>(value: T) => {
    if (isFalsy(value)) return true;
    if (isWhitespaceString(value)) return true;
    if (isEmptySet(value)) return true;
    if (isEmptyMap(value)) return true;
    if (isInvalidDate(value)) return true;
    return isEmptyCollection(value);
};

/**
 * @remarks {@link isNotBlank isNotBlank()} checks if a value is not 'blank'
 *
 * @param {uknown} value The value to check
 *
 * @returns boolean
 *
 * @example
 * ```ts
 * isNotBlank(null); // false
 * isNotBlank(undefined); // false
 * isNotBlank(0); // false
 * isNotBlank(false); // false
 * isNotBlank(''); // false
 * isNotBlank(' \r\n'); //false
 * isNotBlank(NaN); // false
 * isNotBlank([]); // false
 * isNotBlank({}); // false
 * isNotBlank(new Date('hello')); // false
 * isNotBlank(new Set()); // false
 * isNotBlank(new Map()); // false
 * isNotBlank(1); // true
 * isNotBlank('hello world'); // true
 * isNotBlank({ foo: bar }); // true
 * isNotBlank([1,2,3]); // true
 * isNotBlank(new Set([1,2,3])); // true
 * isNotBlank(new Map([['foo', 'bar'], ['baz', 'buzz']])); // true
 * isNotBlank(new Date()); // true
 * ```
 */

export const isNotBlank = <T = unknown>(value: T): value is NonNullable<T> => {
    return (
        !isFalsy(value) &&
        !isWhitespaceString(value) &&
        !isEmptySet(value) &&
        !isEmptyMap(value) &&
        !isInvalidDate(value) &&
        !isEmptyCollection(value)
    );
};

// Stolen from https://github.com/sindresorhus/is-plain-obj
export function isPlainObject<Value>(
    value: unknown,
): value is Record<PropertyKey, Value> {
    if (typeof value !== 'object' || value === null) {
        return false;
    }

    const prototype = Object.getPrototypeOf(value);
    return (
        (prototype === null ||
            prototype === Object.prototype ||
            Object.getPrototypeOf(prototype) === null) &&
        !(Symbol.toStringTag in value) &&
        !(Symbol.iterator in value)
    );
}
