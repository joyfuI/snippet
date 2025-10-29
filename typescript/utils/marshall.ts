// https://github.com/aws/aws-sdk-js-v3/blob/main/packages/util-dynamodb/src/marshall.ts
type Binary =
  | ArrayBuffer
  | Blob
  | Buffer
  | DataView
  | File
  | Int8Array
  | Uint8Array
  | Uint8ClampedArray
  | Int16Array
  | Uint16Array
  | Int32Array
  | Uint32Array
  | Float32Array
  | Float64Array
  | BigInt64Array
  | BigUint64Array;
type NullDataType = { NULL: true };
type ListDataType = { L: DataType[] };
type SetDataType =
  | { NS: string[] }
  | { BS: Binary[] }
  | { SS: string[] }
  | NullDataType;
type MapDataType = { M: DataType };
type BinaryDataType = { B: Binary };
type BooleanDataType = { BOOL: boolean };
type NumberDataType = { N: string };
type StringDataType = { S: string };
type DataType =
  | { [k: string]: DataType }
  | NullDataType
  | ListDataType
  | SetDataType
  | MapDataType
  | BinaryDataType
  | BooleanDataType
  | NumberDataType
  | StringDataType;

const isBinary = (data: unknown): data is Binary => {
  const binaryTypes = [
    'ArrayBuffer',
    'Blob',
    'Buffer',
    'DataView',
    'File',
    'Int8Array',
    'Uint8Array',
    'Uint8ClampedArray',
    'Int16Array',
    'Uint16Array',
    'Int32Array',
    'Uint32Array',
    'Float32Array',
    'Float64Array',
    'BigInt64Array',
    'BigUint64Array',
  ];

  if (data?.constructor) {
    return binaryTypes.includes(data.constructor.name);
  }
  return false;
};

const convertNull = (): NullDataType => ({ NULL: true });
const convertList = (listData: unknown[]): ListDataType => ({
  L: listData
  .values()
  .map(convert)
  .filter((item): item is DataType => item !== undefined)
  .toArray(),
});
const convertSet = (setData: Set<unknown>): SetDataType => {
  if (setData.size === 0) {
    return convertNull();
  }
  const value = setData.values().next().value;
  if (typeof value === 'number' || typeof value === 'bigint') {
    return {
      NS: Array.from(setData).map(
        (item) => convertNumber(item as number | bigint).N,
      ),
    };
  }
  if (typeof value === 'string') {
    return {
      SS: Array.from(setData).map((item) => convertString(item as string).S),
    };
  }
  if (isBinary(value)) {
    return {
      BS: Array.from(setData).map((item) => convertBinary(item as Binary).B),
    };
  }
  return convertNull();
};
const convertMap = (mapData: object): MapDataType => ({
  M: Object.entries(mapData).reduce<{ [k: string]: DataType }>(
    (acc, [key, value]) => {
      const data = convert(value);
      if (data) {
        acc[key] = data;
      }
      return acc;
    },
    {},
  ),
});
const convertBinary = (binaryData: Binary): BinaryDataType => ({
  B: binaryData,
});
const convertBoolean = (booleanData: boolean): BooleanDataType => ({
  BOOL: booleanData.valueOf(),
});
const convertNumber = (numberData: number | bigint): NumberDataType => ({
  N: numberData.toString(),
});
const convertString = (stringData: string): StringDataType => ({
  S: stringData.toString(),
});

const convert = (data: unknown): DataType | undefined => {
  if (typeof data === 'function') {
    return undefined;
  }
  if (data === null) {
    return convertNull();
  }
  if (Array.isArray(data)) {
    return convertList(data);
  }
  if (data?.constructor?.name === 'Set') {
    return convertSet(data as Set<unknown>);
  }
  if (data?.constructor?.name === 'Map') {
    return convertMap(Object.fromEntries(data as Map<string, unknown>));
  }
  if (typeof data === 'object') {
    return convertMap(data);
  }
  if (isBinary(data)) {
    return convertBinary(data);
  }
  if (typeof data === 'boolean') {
    return convertBoolean(data);
  }
  if (typeof data === 'number' || typeof data === 'bigint') {
    return convertNumber(data);
  }
  if (typeof data === 'string') {
    return convertString(data);
  }
  return undefined;
};

/**
 * 자바스크립트 객체를 AWS DynamoDB Item 형식으로 마샬링하는 함수\
 * 잘못된 데이터는 무시
 * @param data 자바스크립트 객체
 * @returns 마샬링된 객체
 */
const marshall = (data: unknown) => convert(data);

export default marshall;
