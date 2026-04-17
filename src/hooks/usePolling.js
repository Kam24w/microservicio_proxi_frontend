import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook para hacer polling de datos cada `interval` ms.
 * Se detiene automáticamente al desmontar el componente.
 */
export const usePolling = (fetchFn, interval = 3000) => {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const timerRef              = useRef(null);

  const fetch = useCallback(async () => {
    try {
      const result = await fetchFn();
      setData(result.data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  }, [fetchFn]);

  useEffect(() => {
    fetch();
    timerRef.current = setInterval(fetch, interval);
    return () => clearInterval(timerRef.current);
  }, [fetch, interval]);

  const refresh = useCallback(() => fetch(), [fetch]);

  return { data, loading, error, refresh };
};
