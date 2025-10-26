/**
 * 비동기로 파일을 읽는 함수(Promise)
 * @param file 읽을 파일
 * @param mode buf: ArrayBuffer, url: DataURL, text: Text, bin: BinaryString
 * @returns 읽은 결과
 */
function asyncFileReader(file: Blob | File, mode: 'buf'): Promise<ArrayBuffer>;
/**
 * 비동기로 파일을 읽는 함수(Promise)
 * @param file 읽을 파일
 * @param mode buf: ArrayBuffer, url: DataURL, text: Text, bin: BinaryString
 * @returns 읽은 결과
 */
function asyncFileReader(file: Blob | File, mode: 'url'): Promise<string>;
/**
 * 비동기로 파일을 읽는 함수(Promise)
 * @param file 읽을 파일
 * @param mode buf: ArrayBuffer, url: DataURL, text: Text, bin: BinaryString
 * @returns 읽은 결과
 */
function asyncFileReader(file: Blob | File, mode: 'text'): Promise<string>;
/**
 * 비동기로 파일을 읽는 함수(Promise)
 * @param file 읽을 파일
 * @param mode buf: ArrayBuffer, url: DataURL, text: Text, bin: BinaryString
 * @returns 읽은 결과
 */
function asyncFileReader(file: Blob | File, mode?: 'bin'): Promise<string>;

function asyncFileReader(
  file: Blob | File,
  mode?: 'buf' | 'url' | 'text' | 'bin',
) {
  return new Promise<string | ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (reader.result) {
        if (mode === 'bin') {
          const arrayBuffer = reader.result as ArrayBuffer;
          const bytes = new Uint8Array(arrayBuffer);
          const binaryString = Array.from(bytes, (byte) =>
            String.fromCharCode(byte),
          ).join('');
          resolve(binaryString);
          return;
        }
        resolve(reader.result);
      }
    };
    reader.onerror = () => {
      reject(reader.error);
    };

    switch (mode) {
      case 'url':
        reader.readAsDataURL(file);
        break;

      case 'text':
        reader.readAsText(file);
        break;

      default:
        reader.readAsArrayBuffer(file);
        break;
    }
  });
}

export default asyncFileReader;
