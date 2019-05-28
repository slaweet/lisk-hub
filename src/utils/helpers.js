/**
 * Deeply merge two objects recursively, if the value isn't an object it considers
 * the value of the second object.
 * @param {Object} obj1 - Object to be merged into.
 * @param {Object} obj2 - Object with new values to be merged onto obj1.
 */
export const deepMergeObj = (obj1, obj2) =>
  Object.keys({ ...obj2 }).reduce((obj, key) => (
    typeof obj2[key] === 'object' && typeof obj1[key] === 'object'
      && !Array.isArray(obj2[key]) && !Array.isArray(obj1[key])
      ? { ...obj, [key]: deepMergeObj(obj1[key], obj2[key]) }
      : { ...obj, [key]: obj2[key] }
  ), obj1);

/**
 * Removes undefined keys from an object.
 * @param {Object} obj - Source object
 * @returns {Object} - Simplified object
 */
export const removeUndefinedKeys = obj => Object.keys(obj).reduce((acc, key) => {
  const item = obj[key];

  if (typeof item !== 'undefined') {
    acc[key] = item;
  }

  return acc;
}, {});


/**
 * Checks if the given collection is empty.
 * @param {Object|Array} collection
 * @returns {Boolean}
 */
export const isEmpty = (collection) => {
  if (Array.isArray(collection)) {
    return collection.length === 0;
  }

  return Object.keys(collection).length === 0;
};