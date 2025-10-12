import { useCallback, useRef, useSyncExternalStore } from 'react';

type CustomCSSVariableEvent = CustomEvent<{ key: string }>;

declare global {
  interface ElementEventMap {
    cssvariable: CustomCSSVariableEvent;
  }
}

/**
 * CSS 변수를 다루는 훅
 * @param key CSS 변수명
 * @param initialValue 값이 없을 때 사용할 기본값
 * @param scope CSS 변수 스코프(셀렉터 또는 ref). 기본값: :root
 * @returns [저장된 값, 변경 함수]
 */
const useCSSVariable = (
  key: string,
  initialValue: string | (() => string),
  scope: string | HTMLElement = ':root',
) => {
  const subscribe = useCallback(
    (callback: () => void) => {
      const element =
        typeof scope === 'string'
          ? (document.querySelector(scope) ?? document.documentElement)
          : scope;
      const handleCSSVariableEvent = (event: CustomCSSVariableEvent) => {
        if (event.detail.key === key) {
          callback();
        }
      };

      element.addEventListener('cssvariable', handleCSSVariableEvent);
      return () => {
        element.removeEventListener('cssvariable', handleCSSVariableEvent);
      };
    },
    [key, scope],
  );

  const getSnapshot = useCallback(() => {
    const element =
      typeof scope === 'string'
        ? (document.querySelector(scope) ?? document.documentElement)
        : scope;
    const variables = getComputedStyle(element);
    const value = variables.getPropertyValue(key); // 값이 없으면 빈문자열을 반환
    return (
      value ||
      (typeof initialValue === 'function' ? initialValue() : initialValue)
    );
  }, [key, initialValue, scope]);

  const storedValue = useSyncExternalStore(subscribe, getSnapshot);
  const storedValueRef = useRef(storedValue);
  storedValueRef.current = storedValue;

  const setValue = useCallback(
    (newValue: string | ((oldValue: string) => string)) => {
      const value =
        typeof newValue === 'function'
          ? newValue(storedValueRef.current)
          : newValue;
      const element: HTMLElement =
        typeof scope === 'string'
          ? (document.querySelector(scope) ?? document.documentElement)
          : scope;
      element.style.setProperty(key, value);
      element.dispatchEvent(
        new CustomEvent('cssvariable', { detail: { key } }),
      ); // 커스텀 이벤트 발생
    },
    [key, scope],
  );

  return [storedValue, setValue];
};

export default useCSSVariable;
