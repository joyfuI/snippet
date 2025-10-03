import { useCallback, useMemo, useRef, useSyncExternalStore } from 'react';

type CustomStorageEvent = CustomEvent<{ key: string }>;

declare global {
  interface WindowEventMap {
    [k: string]: CustomStorageEvent;
  }
}

const useStorage = <T>(
  storage: Storage,
  eventType: string,
  key: string,
  initialValue: T,
) => {
  const initialValueRef = useRef<T>(initialValue);
  initialValueRef.current = initialValue;
  const storedValueRef = useRef<T>(initialValue);

  const subscribe = useCallback(
    (callback: () => void) => {
      const handleStorageEvent = (event: StorageEvent | CustomStorageEvent) => {
        if (event instanceof StorageEvent) {
          if (event.key === key) {
            callback();
          }
        } else if (event instanceof CustomEvent) {
          if (event.detail.key === key) {
            callback();
          }
        }
      };

      window.addEventListener('storage', handleStorageEvent); // 다른 탭
      window.addEventListener(eventType, handleStorageEvent); // 같은 탭
      return () => {
        window.removeEventListener('storage', handleStorageEvent);
        window.removeEventListener(eventType, handleStorageEvent);
      };
    },
    [eventType, key],
  );

  const getSnapshot = useCallback(() => storage.getItem(key), [storage, key]);

  const item = useSyncExternalStore(subscribe, getSnapshot);

  const storedValue = useMemo(() => {
    try {
      return item ? (JSON.parse(item) as T) : initialValueRef.current;
    } catch {
      return initialValueRef.current;
    }
  }, [item]);
  storedValueRef.current = storedValue;

  const setValue = useCallback(
    (newValue: T | ((oldValue: T) => T)) => {
      const value =
        typeof newValue === 'function'
          ? (newValue as (oldValue: T) => T)(storedValueRef.current)
          : newValue;
      storage.setItem(key, JSON.stringify(value));
      window.dispatchEvent(new CustomEvent(eventType, { detail: { key } })); // 커스텀 이벤트 발생
    },
    [storage, eventType, key],
  );

  const delValue = useCallback(() => {
    storage.removeItem(key);
    window.dispatchEvent(new CustomEvent(eventType, { detail: { key } })); // 커스텀 이벤트 발생
  }, [storage, eventType, key]);

  return [storedValue, setValue, delValue] as const;
};

/**
 * 로컬스토리지를 다루는 훅
 * @param key 로컬스토리지에 저장할 키
 * @param initialValue 값이 없을 때 사용할 기본값
 * @returns [저장된 값, 변경 함수, 삭제 함수]
 */
export const useLocalStorage = <T>(key: string, initialValue: T) =>
  useStorage(window.localStorage, 'localstorage', key, initialValue);

/**
 * 세션스토리지를 다루는 훅
 * @param key 세션스토리지에 저장할 키
 * @param initialValue 값이 없을 때 사용할 기본값
 * @returns [저장된 값, 변경 함수, 삭제 함수]
 */
export const useSessionStorage = <T>(key: string, initialValue: T) =>
  useStorage(window.sessionStorage, 'sessionstorage', key, initialValue);
