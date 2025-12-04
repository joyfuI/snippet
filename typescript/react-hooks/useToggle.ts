import { useCallback, useState } from 'react';

/**
 * 토글 훅
 * @param initialValue 초기값
 * @returns [현재값, 토글함수, 설정함수]
 */
const useToggle = (initialValue: boolean | (() => boolean) = false) => {
  const [value, setValue] = useState(initialValue);

  const toggleValue = useCallback(() => setValue((prev) => !prev), []);

  return [value, toggleValue, setValue] as const;
};

export default useToggle;
