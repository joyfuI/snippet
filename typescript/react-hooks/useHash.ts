import { useCallback, useRef, useSyncExternalStore } from 'react';

const subscribe = (callback: () => void) => {
  window.addEventListener('hashchange', callback);
  return () => {
    window.removeEventListener('hashchange', callback);
  };
};

/**
 * hash를 다루는 훅
 * @param initialValue 값이 없을 때 사용할 기본값
 * @returns [hash, 변경 함수]
 */
const useHash = (initialValue: string | (() => string) = '') => {
  const getSnapshot = useCallback(() => {
    const value = decodeURIComponent(window.location.hash);
    return (
      value ||
      (typeof initialValue === 'function' ? initialValue() : initialValue)
    );
  }, [initialValue]);

  const hash = useSyncExternalStore(subscribe, getSnapshot);
  const hashRef = useRef(hash);
  hashRef.current = hash;

  const setHash = useCallback(
    (newValue: string | ((oldValue: string) => string)) => {
      const value =
        typeof newValue === 'function'
          ? (newValue as (oldValue: string) => string)(hashRef.current)
          : newValue;
      if (value) {
        window.location.hash = value;
      } else {
        // 빈값일 때 url 끝에 #이 보기싫어서 제거
        window.location.hash = '';
        const newUrl = `${window.location.pathname}${window.location.search}`;
        window.history.replaceState(null, '', newUrl);
      }
    },
    [],
  );

  return [hash, setHash] as const;
};

export default useHash;
