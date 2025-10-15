/**
 * 바이트 단위를 사람이 읽기 쉬운 단위(KB, MB, GB 등)로 변환해주는 함수\
 * 1024단위로 계산하지만 대중적인 십진 접두어를 사용함
 * @param bytes 바이트 수
 * @param fractionDigits 소수점 자리수
 * @returns 변환된 용량 문자열
 */
const formatBytes = (bytes: number, fractionDigits: number = 0): string => {
  if (!bytes) {
    return '0 B';
  }
  const k = 1024;
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.min(
    Math.floor(Math.log(bytes) / Math.log(k)),
    units.length - 1,
  );
  const value = bytes / k ** i;
  const fixed = value.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: fractionDigits,
    useGrouping: false,
  });
  return `${fixed} ${units[i]}`;
};

export default formatBytes;
