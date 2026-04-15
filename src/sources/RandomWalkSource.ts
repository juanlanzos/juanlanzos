import {
  BaseDataSource,
  DataSourceMetadata,
} from '../core/DataSource';

export type RandomWalkOptions = {
  intervalMs?: number;
  start?: number;
  volatility?: number;
  min?: number;
  max?: number;
};

/**
 * Demo data source: emits a smoothed random-walk signal. Handy for
 * developing UI without any network dependency.
 */
export class RandomWalkSource extends BaseDataSource {
  private timer: ReturnType<typeof setInterval> | null = null;
  private value: number;
  private readonly opts: Required<RandomWalkOptions>;

  constructor(metadata: DataSourceMetadata, options: RandomWalkOptions = {}) {
    super(metadata);
    this.opts = {
      intervalMs: options.intervalMs ?? 1000,
      start: options.start ?? 50,
      volatility: options.volatility ?? 4,
      min: options.min ?? 0,
      max: options.max ?? 100,
    };
    this.value = this.opts.start;
  }

  start(): void {
    if (this.timer) return;
    this.setStatus('running');
    this.timer = setInterval(() => {
      const delta = (Math.random() - 0.5) * 2 * this.opts.volatility;
      this.value = Math.max(
        this.opts.min,
        Math.min(this.opts.max, this.value + delta),
      );
      this.emit({ timestamp: Date.now(), value: this.value });
    }, this.opts.intervalMs);
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.setStatus('stopped');
  }
}
