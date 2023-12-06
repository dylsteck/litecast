import { useEffect, useRef } from 'react';

/**
 *  This hook will call the provided refetch function when the screen has
 * focus again.
 *
 * @example
 * ```js
 *  useReFetchOnFocus(
 *     useCallback(function fetchHelloApi() {
 *       getApiHello().then(res => {
 *         setResponse(res);
 *       });
 *     }, []),
 *     true,
 *   );
 * ```
 *
 * if you need some detail example how to use this hook please check this out
 */

export const useRefetchOnFocus = (refetch: () => void, onDidMount = true) => {
  const firstTimeRef = useRef(true);

  useEffect(
    function fetchOnDidMount() {
      if (onDidMount) {
        refetch();
      }
    },
    [refetch],
  );

  useEffect(() => {
    const onFocus = () => {
      if (firstTimeRef.current) {
        firstTimeRef.current = false;
        return;
      }
      refetch();
    };

    window.addEventListener('focus', onFocus);
    onFocus();

    return () => {
      window.removeEventListener('focus', onFocus);
    };
  }, []);
};
