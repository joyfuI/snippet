const textEncoder = new TextEncoder();

/**
 * 문자열의 바이트 수를 구하는 함수
 * @param str 문자열
 * @returns 바이트 수
 */
const getByteLength = (str: string): number => textEncoder.encode(str).length;

export default getByteLength;
