import { useEffect, useRef } from 'react';

/**
 * setInterval 훅. setInterval과 다르게 최초에 callback을 한번 실행하고 반복함
 * @param callback 컴포넌트가 마운트 된 직후에 실행할 함수
 * @param ms ms마다 반복
 */
const useInterval = (callback: () => void, ms: number) => {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    const timer = setInterval(callbackRef.current, ms);
    callbackRef.current();
    return () => clearInterval(timer);
  }, [ms]);
};

export default useInterval;
