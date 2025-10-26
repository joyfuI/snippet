import { useCallback, useMemo, useRef, useSyncExternalStore } from 'react';

type URLSearchParamsInit =
  | string[][]
  | Record<string, string>
  | string
  | URLSearchParams;

const subscribe = (callback: () => void) => {
  window.addEventListener('searchParams', callback);
  return () => {
    window.removeEventListener('searchParams', callback);
  };
};

const getSnapshot = () => window.location.search;

/**
 * URLSearchParams를 다루는 훅\
 * react-router-dom의 useSearchParams는 리렌더링이 일어나서 react-router-dom과 별개로 제작\
 * 추가로 getAll에 메모이제이션이 적용
 * @returns [URLSearchParams, 변경 함수]
 */
const useSearchParams = () => {
  const item = useSyncExternalStore(subscribe, getSnapshot);

  const searchParams = useMemo(() => new URLSearchParams(item), [item]);
  const searchParamsRef = useRef(searchParams);
  searchParamsRef.current = searchParams;

  const setSearchParams = useCallback(
    (
      newValue:
        | URLSearchParamsInit
        | ((oldValue: URLSearchParams) => URLSearchParamsInit),
    ) => {
      const value =
        typeof newValue === 'function'
          ? (newValue as (oldValue: URLSearchParams) => URLSearchParamsInit)(
            searchParamsRef.current,
          )
          : newValue;
      const newSearchParams = new URLSearchParams(value);
      const newUrl = `${window.location.pathname}?${newSearchParams.toString()}${
        window.location.hash
      }`;
      window.history.replaceState(null, '', newUrl);
      window.dispatchEvent(
        new CustomEvent('searchParams', {
          detail: { searchParams: newSearchParams },
        }),
      ); // 커스텀 이벤트 발생
    },
    [],
  );

  // getAll는 매번 새로운 배열을 반환하니까 메모이제이션을 적용한 getAll
  searchParams.getAll = useMemo(() => {
    const cache = new Map();

    return (name) => {
      if (cache.has(name)) {
        return cache.get(name);
      }
      const originalGetAll = URLSearchParams.prototype.getAll;
      const result = originalGetAll.call(searchParams, name); // 원본 getAll 사용
      cache.set(name, result);
      return result;
    };
  }, [searchParams]);

  return [searchParams, setSearchParams] as const;
};

export default useSearchParams;
