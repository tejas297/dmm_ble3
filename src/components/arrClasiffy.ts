const classifyArray = (arr: string[][]): {
  deviceIdArray: string[];
  readingsArray: string[];
  commodityArray: string[];
} => {
  let deviceIdArray: string[] = [];
  let readingsArray: string[] = [];
  let commodityArray: string[] = [];

  arr.forEach((valueArray) => {
    const joined = valueArray.join(',').trim();

    if (/^DMMBLE/i.test(joined)) {
      deviceIdArray = [joined];
    } else if (
      valueArray.length === 3 &&
      valueArray.every((v) => /^\d+(\.\d+)?$/.test(v)) // match int/float
    ) {
      readingsArray = valueArray;
    } else if (commodityArray.length === 0) {
      commodityArray = valueArray;
    }
  });

  return { deviceIdArray, readingsArray, commodityArray };
};

export default classifyArray;