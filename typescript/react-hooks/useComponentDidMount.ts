import { useEffect, useEffectEvent } from 'react';

/**
 * componentDidMount 훅
 * @param callback 컴포넌트가 마운트 된 직후에 실행할 함수
 */
const useComponentDidMount = (callback: () => void) => {
  const func = useEffectEvent(callback);

  useEffect(() => {
    func();
  }, []);
};

export default useComponentDidMount;
