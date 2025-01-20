export const flattenArray = <T>(arr: T[][]): T[] => {
  return arr.reduce((acc, subArray) => acc.concat(subArray), []);
};

export const unflattenArray = <T>(
  arr: T[],
  subArrayLength: number
): T[][] => {
  const result = [];
  for (let i = 0; i < arr.length; i += subArrayLength) {
    result.push(arr.slice(i, i + subArrayLength));
  }
  return result;
};
