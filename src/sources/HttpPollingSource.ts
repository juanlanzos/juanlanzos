import {
  BaseDataSource,
  DataSourceMetadata,
} from '../core/DataSource';

export type HttpPollingOptions = {
  url: string;
  /** How often to fetch, in ms. */
  intervalMs?: number;
  /** Extract a numeric value from the JSON response. */
  parse: (json: unknown) => number;
  /** Optional fetch init (headers, auth, etc). */
  init?: RequestInit;
};

/**
 * Periodically hits an HTTP endpoint and emits the parsed numeric value.
 * Designed for REST APIs that expose metrics (Prometheus, Grafana, custom
 * backends). Swap in `parse` to reach into the response shape you have.
 */
export class HttpPollingSource extends BaseDataSource {
  private timer: ReturnType<typeof setInterval> | null = null;
  private readonly opts: Required<Omit<HttpPollingOptions, 'init'>> & {
    init?: RequestInit;
  };

  constructor(metadata: DataSourceMetadata, options: HttpPollingOptions) {
    super(metadata);
    this.opts = {
      url: options.url,
      intervalMs: options.intervalMs ?? 5000,
      parse: options.parse,
      init: options.init,
    };
  }

  async start(): Promise<void> {
    if (this.timer) return;
    this.setStatus('connecting');
    await this.tick();
    this.timer = setInterval(() => {
      void this.tick();
    }, this.opts.intervalMs);
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.setStatus('stopped');
  }

  private async tick(): Promise<void> {
    try {
      const res = await fetch(this.opts.url, this.opts.init);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const value = this.opts.parse(json);
      if (Number.isFinite(value)) {
        this.setStatus('running');
        this.emit({ timestamp: Date.now(), value });
      }
    } catch (err) {
      this.setStatus('error', err instanceof Error ? err : new Error(String(err)));
    }
  }
}
