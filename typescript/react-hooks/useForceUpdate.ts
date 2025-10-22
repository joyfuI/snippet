import { useReducer } from 'react';

/**
 * 강제 리렌더링 훅
 * @returns 강제 리렌더링 함수
 */
const useForceUpdate = () => {
  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  return forceUpdate;
};

export default useForceUpdate;
