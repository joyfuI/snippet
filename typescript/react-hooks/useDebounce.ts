import { useCallback, useEffect, useRef } from 'react';

/**
 * 쓰로틀링 훅
 * @param func 함수
 * @param ms 함수 실행 후 실행이 호출이 무시될 시간
 * @returns 쓰로틀링이 적용된 함수
 */
const useDebounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  ms: number,
) => {
  const funcRef = useRef(func);
  funcRef.current = func;
  const timeoutId = useRef<NodeJS.Timeout | null>(null);

  const debounce = useCallback(
    (...args: unknown[]) => {
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }
      timeoutId.current = setTimeout(() => {
        funcRef.current(...args);
        timeoutId.current = null;
      }, ms);
    },
    [ms],
  );

  useEffect(
    () => () => {
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }
    },
    [],
  );

  return debounce;
};

export default useDebounce;
