import { useSyncExternalStore } from 'react';

const subscribe = (callback: () => void) => {
  document.addEventListener('visibilitychange', callback);
  return () => {
    document.removeEventListener('visibilitychange', callback);
  };
};

const getSnapshot = () => document.hidden;

const getServerSnapshot = () => false;

/**
 * 현재 페이지가 보이는 상태인지 반환하는 훅
 * @returns 현재 페이지가 보이는 상태인지 여부
 */
const usePageVisibility = () => {
  const hidden = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  return !hidden;
};

export default usePageVisibility;
