import { useEffect, useRef } from 'react';

export function useAutoRefresh(fetchFunction, interval = 2000, immediate = true) {
  const intervalRef = useRef(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    if (immediate && isMounted.current) {
      fetchFunction();
    }

    intervalRef.current = setInterval(() => {
      if (isMounted.current) {
        fetchFunction();
      }
    }, interval);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isMounted.current) {
        fetchFunction();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isMounted.current = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchFunction, interval, immediate]);
}