import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import {
  DataPoint,
  DataSource,
  DataSourceStatus,
} from './DataSource';
import { registry } from './DataSourceRegistry';

export type DataSourceState = {
  status: DataSourceStatus;
  latest?: DataPoint;
  history: DataPoint[];
  error?: Error;
};

/**
 * React hook that subscribes to a DataSource and keeps a rolling window of
 * recent samples. The source auto-starts on mount and stops on unmount
 * (unless `autoStart` is false).
 */
export function useDataSource(
  source: DataSource,
  options: { historySize?: number; autoStart?: boolean } = {},
): DataSourceState {
  const { historySize = 60, autoStart = true } = options;
  const [state, setState] = useState<DataSourceState>({
    status: source.status,
    history: [],
  });
  const historyRef = useRef<DataPoint[]>([]);

  useEffect(() => {
    const offData = source.onData((point) => {
      const next = [...historyRef.current, point];
      if (next.length > historySize) next.splice(0, next.length - historySize);
      historyRef.current = next;
      setState((prev) => ({ ...prev, latest: point, history: next }));
    });

    const offStatus = source.onStatus((status, error) => {
      setState((prev) => ({ ...prev, status, error }));
    });

    if (autoStart) void source.start();

    return () => {
      offData();
      offStatus();
      if (autoStart) void source.stop();
    };
  }, [source, historySize, autoStart]);

  return state;
}

/**
 * Re-renders components when sources are added or removed from the registry.
 */
export function useRegisteredSources(): DataSource[] {
  return useSyncExternalStore(
    (cb) => registry.subscribe(cb),
    () => registry.list(),
    () => registry.list(),
  );
}
