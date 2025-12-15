/*
 * CSV 포맷 규칙
 * 1. 레코드는 줄 바꿈으로 구분
 * 2. 파일의 마지막 줄 바꿈은 선택
 * 3. 첫번째 행에는 일반 레코드와 동일한 형식을 갖는 헤더행이 있을 수 있음
 * 4. 헤더와 각 레코드 내에 하나 이상의 필드는 쉼표로 구분
 * 5. 각 필드는 큰 따옴표로 묶을 수도 있고 안묶일 수도 있음
 * 6. 줄 바꿈, 큰 따옴표 및 쉼표가 포함 된 필드는 큰 따옴표로 묶어야 함
 * 7. 필드를 둘러싸는 데 큰 따옴표가 사용된 경우에는 다른 큰 따옴표를 사용하여 필드 안에 표시된 큰 따옴표를 먼저 처리하여 해당 필드에서 벗어나야 함 (예: " -> """")
 */

const BOM = '\uFEFF';
const RULE6_REGEX = /[\n",]/;
const RULE7_REGEX = /"/;

const quoteEscape = (value: unknown): string => {
  let str =
    typeof value === 'object' && value !== null
      ? JSON.stringify(value)
      : (value?.toString() ?? '');
  if (RULE6_REGEX.test(str)) {
    if (RULE7_REGEX.test(str)) {
      str = str.replaceAll('"', '""');
    }
    str = `"${str}"`;
  }
  return str;
};

/**
 * 데이터를 csv string으로 만들어주는 함수
 * @param columns 칼럼 이름 배열
 * @param rows 칼럼을 키로 가지는 object 배열
 * @returns csv string
 */
const json2csv = (columns: string[], rows: Record<string, unknown>[]) => {
  let csv = `${columns.map(quoteEscape).join(',')}\n`;
  rows.forEach((row) => {
    const arr: string[] = [];
    columns.forEach((column) => {
      arr.push(quoteEscape(row[column]));
    });
    csv += `${arr.join(',')}\n`;
  });
  return csv;
};

/**
 * json2csv에서 생성한 csv 다운로드
 * @param csv csv string
 * @param filename 파일명
 */
export const download = (csv: string, filename: string) => {
  // 한글깨짐 문제를 해결하기 위해 BOM 문자 삽입
  const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

export default json2csv;
