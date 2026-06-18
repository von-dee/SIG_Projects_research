import { useEffect, useState } from 'react';
import type { ApiState } from '../types/fleet';

export function useAsyncData<T>(loader: () => Promise<T>, deps: React.DependencyList = []): ApiState<T> {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    error: null,
    isLoading: true
  });

  useEffect(() => {
    let active = true;
    setState((current) => ({ ...current, error: null, isLoading: true }));

    loader()
      .then((data) => {
        if (active) setState({ data, error: null, isLoading: false });
      })
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : 'Something went wrong';
        if (active) setState({ data: null, error: message, isLoading: false });
      });

    return () => {
      active = false;
    };
  }, deps);

  return state;
}
