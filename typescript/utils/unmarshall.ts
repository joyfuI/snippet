// https://github.com/aws/aws-sdk-js-v3/blob/main/packages/util-dynamodb/src/unmarshall.ts
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

const convertNull = () => null;
const convertBoolean = Boolean;
const convertNumber = (numberValue: string) => {
  const num = Number(numberValue);
  return num > Number.MAX_SAFE_INTEGER ||
  num < Number.MIN_SAFE_INTEGER ||
  num === Number.POSITIVE_INFINITY ||
  num === Number.NEGATIVE_INFINITY
    ? BigInt(numberValue)
    : num;
};
const convertBinary = (binaryValue: Uint8Array): Uint8Array => binaryValue;
const convertString = (stringValue: string) => stringValue;
const convertList = (listValue: DataType[]) => listValue.map(convert);
const convertMap = (mapValue: Record<string, DataType>) =>
  Object.entries(mapValue).reduce(
    (acc: Record<string, unknown>, [key, value]) => {
      acc[key] = convert(value);
      return acc;
    },
    {},
  );

const convMap = {
  NULL: convertNull,
  BOOL: convertBoolean,
  N: convertNumber,
  B: convertBinary,
  S: convertString,
  L: convertList,
  M: convertMap,
  NS: (value: string[]) => new Set(value.map(convertNumber)),
  BS: (value: Uint8Array[]) => new Set(value.map(convertBinary)),
  SS: (value: string[]) => new Set(value.map(convertString)),
};

const convert = (data: DataType): unknown => {
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    return data;
  }

  const [key, value] = Object.entries(data)[0];

  if (value === undefined) {
    return undefined;
  }
  return convMap[key as keyof typeof convMap]?.(value) ?? data;
};

/**
 * AWS DynamoDB Item 객체를 일반적인 자바스크립트 객체 형식으로 언마샬링하는 함수\
 * 잘못된 데이터는 유지
 * @param data AWS DynamoDB Item 객체
 * @returns 언마샬링된 객체
 */
const unmarshall = (data: DataType) => convert({ M: data });

export default unmarshall;
