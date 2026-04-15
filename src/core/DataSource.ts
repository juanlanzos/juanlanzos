/**
 * Core contract for any data source that feeds the dashboard.
 *
 * A DataSource is deliberately small: it emits `DataPoint`s at whatever cadence
 * makes sense for the underlying transport (polling, websocket, SSE, BLE, etc.).
 * The UI never needs to know where data comes from.
 */

export type DataPoint = {
  /** Unix ms timestamp when the sample was produced. */
  timestamp: number;
  /** Numeric value for charts and aggregations. */
  value: number;
  /** Optional free-form metadata (kept tiny to avoid GC churn). */
  meta?: Record<string, string | number | boolean>;
};

export type DataSourceStatus =
  | 'idle'
  | 'connecting'
  | 'running'
  | 'error'
  | 'stopped';

export type DataSourceListener = (point: DataPoint) => void;
export type StatusListener = (status: DataSourceStatus, error?: Error) => void;

export interface DataSourceMetadata {
  /** Stable id used in the registry and for persistence. */
  id: string;
  /** Human readable name shown in the UI. */
  name: string;
  /** Short description / units. */
  description?: string;
  /** Unit suffix like "%", "ms", "req/s". */
  unit?: string;
  /** Suggested color for charts. */
  color?: string;
}

export interface DataSource {
  readonly metadata: DataSourceMetadata;
  readonly status: DataSourceStatus;

  /** Begin producing data. Idempotent: calling twice is a no-op. */
  start(): Promise<void> | void;
  /** Stop producing data and release resources. */
  stop(): Promise<void> | void;

  /** Subscribe to new data points. Returns an unsubscribe function. */
  onData(listener: DataSourceListener): () => void;
  /** Subscribe to status changes. Returns an unsubscribe function. */
  onStatus(listener: StatusListener): () => void;
}

/**
 * Small base class that wires up listeners + status tracking so concrete
 * sources only implement `start` / `stop` and call `emit` / `setStatus`.
 */
export abstract class BaseDataSource implements DataSource {
  readonly metadata: DataSourceMetadata;
  private _status: DataSourceStatus = 'idle';
  private dataListeners = new Set<DataSourceListener>();
  private statusListeners = new Set<StatusListener>();

  constructor(metadata: DataSourceMetadata) {
    this.metadata = metadata;
  }

  get status(): DataSourceStatus {
    return this._status;
  }

  abstract start(): Promise<void> | void;
  abstract stop(): Promise<void> | void;

  onData(listener: DataSourceListener): () => void {
    this.dataListeners.add(listener);
    return () => this.dataListeners.delete(listener);
  }

  onStatus(listener: StatusListener): () => void {
    this.statusListeners.add(listener);
    // Emit current status immediately so subscribers don't miss it.
    listener(this._status);
    return () => this.statusListeners.delete(listener);
  }

  protected emit(point: DataPoint): void {
    this.dataListeners.forEach((l) => l(point));
  }

  protected setStatus(status: DataSourceStatus, error?: Error): void {
    if (this._status === status) return;
    this._status = status;
    this.statusListeners.forEach((l) => l(status, error));
  }
}
