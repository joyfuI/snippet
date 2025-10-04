import { useCallback, useEffect, useRef } from 'react';

/**
 * 쓰로틀링 훅
 * @param func 함수
 * @param ms 함수 실행 후 실행이 호출이 무시될 시간
 * @return 쓰로틀링이 적용된 함수
 */
const useThrottle = <T extends (...args: unknown[]) => unknown>(
  func: T,
  ms: number,
) => {
  const funcRef = useRef(func);
  funcRef.current = func;
  const timeoutId = useRef<NodeJS.Timeout | null>(null);

  const throttle = useCallback(
    (...args: unknown[]) => {
      if (!timeoutId.current) {
        timeoutId.current = setTimeout(() => {
          timeoutId.current = null;
        }, ms);
        funcRef.current(...args);
      }
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

  return throttle;
};

export default useThrottle;
