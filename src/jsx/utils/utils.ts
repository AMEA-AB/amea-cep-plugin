/**
 * Executes a provided function once for each array element.
 *
 * @param {T[]} arr - The array to iterate over.
 * @param {(item: T, i: number) => void} callback - Function to execute for each element.
 */
export const forEach = <T>(
  arr: T[],
  callback: (item: T, i: number) => void
): void => {
  for (let i = 0; i < arr.length; i++) {
    callback(arr[i], i);
  }
};

/**
 * Creates a new array with the results of calling a provided function on every element in the array.
 *
 * @param {T[]} arr - The array to map over.
 * @param {(item: T, i: number) => T} callback - Function that produces an element of the new array.
 * @returns {T[]} - A new array with each element being the result of the callback function.
 */
export const map = <T>(
  arr: T[],
  callback: (item: T, i: number) => T
): T[] => {
  let res: T[] = [];
  for (let i = 0; i < arr.length; i++) {
    res.push(callback(arr[i], i));
  }
  return res;
};

/**
 * Creates a new array with all elements that pass the test implemented by the provided function.
 *
 * @param {T[]} arr - The array to filter.
 * @param {(item: T, i: number) => boolean} func - Function to test each element of the array.
 * @returns {T[]} - A new array with the elements that pass the test.
 */
export const filter = <T>(
  arr: T[],
  func: (item: T, i: number) => boolean
): T[] => {
  let res = [];
  for (let i = 0; i < arr.length; i++) {
    if (func(arr[i], i)) {
      res.push(arr[i]);
    }
  }
  return res;
};

/**
 * Determines whether an array includes a certain value among its entries.
 *
 * @param {T[]} arr - The array to search in.
 * @param {T} value - The value to search for.
 * @returns {boolean} - True if the value is found in the array, false otherwise.
 */
export const includes = <T>(arr: T[], value: T): boolean => {
  for (let i = 0; i < arr.length; i++) {
    const element = arr[i];
    if (element === value) {
      return true;
    }
  }
  return false;
};

/**
 * Returns the first index at which a given element can be found in the array, or -1 if it is not present.
 *
 * @param {T[]} arr - The array to search in.
 * @param {string | number} value - The value to locate in the array.
 * @returns {number} - The first index of the element in the array; -1 if not found.
 */
export const indexOf = <T>(arr: T[], value: string | number): number => {
  for (let i = 0; i < arr.length; i++) {
    const element = arr[i];
    if (element === value) {
      return i;
    }
  }
  return -1;
};

/**
 * Joins all given path segments together using the platform specific separator as a delimiter, 
 * then normalizes the resulting path.
 *
 * @param {...string[]} args - The path segments to join.
 * @returns {string} - The joined path.
 */
export const join = (...args: string[]): string => {
  const sep = $.os === "Windows" ? "\\" : "/";
  const len = args.length;
  let res = args[0];
  for (let i = 1; i < len; i++) {
    res = res + sep + args[i];
  }
  return res;
};
