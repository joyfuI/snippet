import { useCallback, useEffect, useRef } from 'react';

/**
 * 디바운싱 훅
 * @param func 함수
 * @param ms 함수 실행 전 대기할 시간
 * @returns 디바운싱이 적용된 함수
 */
const useDebounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  ms: number,
) => {
  const funcRef = useRef(func);
  funcRef.current = func;
  const timer = useRef<NodeJS.Timeout | null>(null);

  const debounce = useCallback(
    (...args: unknown[]) => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
      timer.current = setTimeout(() => {
        funcRef.current(...args);
        timer.current = null;
      }, ms);
    },
    [ms],
  );

  useEffect(
    () => () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    },
    [],
  );

  return debounce;
};

export default useDebounce;
