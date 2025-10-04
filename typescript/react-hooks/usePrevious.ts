import { useEffect, useRef } from 'react';

/**
 * 이전 값을 반환하는 훅. 이전 값이 없으면 주어진 값을 그대로 반환
 * @param value 새 값
 * @returns 이전 값
 */
const usePrevious = <T>(value: T) => {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
};

export default usePrevious;
