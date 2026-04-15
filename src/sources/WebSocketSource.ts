import {
  BaseDataSource,
  DataSourceMetadata,
} from '../core/DataSource';

export type WebSocketSourceOptions = {
  url: string;
  /** Parse an incoming message into a numeric value. Return null to skip. */
  parse: (raw: string) => number | null;
  /** Optional subprotocols. */
  protocols?: string | string[];
  /** Optional first message to send after connect (e.g. subscribe frame). */
  subscribeMessage?: string | object;
  /** Reconnect backoff in ms. */
  reconnectMs?: number;
};

/**
 * Streams data from a WebSocket endpoint. Reconnects with a simple backoff
 * when the connection drops.
 */
export class WebSocketSource extends BaseDataSource {
  private ws: WebSocket | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private stopped = true;
  private readonly opts: Required<Omit<WebSocketSourceOptions, 'protocols' | 'subscribeMessage'>> & {
    protocols?: string | string[];
    subscribeMessage?: string | object;
  };

  constructor(metadata: DataSourceMetadata, options: WebSocketSourceOptions) {
    super(metadata);
    this.opts = {
      url: options.url,
      parse: options.parse,
      reconnectMs: options.reconnectMs ?? 3000,
      protocols: options.protocols,
      subscribeMessage: options.subscribeMessage,
    };
  }

  start(): void {
    this.stopped = false;
    this.connect();
  }

  stop(): void {
    this.stopped = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.onopen = null;
      this.ws.onmessage = null;
      this.ws.onerror = null;
      this.ws.onclose = null;
      this.ws.close();
      this.ws = null;
    }
    this.setStatus('stopped');
  }

  private connect(): void {
    if (this.stopped) return;
    this.setStatus('connecting');
    try {
      this.ws = new WebSocket(this.opts.url, this.opts.protocols);
    } catch (err) {
      this.setStatus('error', err instanceof Error ? err : new Error(String(err)));
      this.scheduleReconnect();
      return;
    }

    this.ws.onopen = () => {
      this.setStatus('running');
      if (this.opts.subscribeMessage !== undefined && this.ws) {
        const msg =
          typeof this.opts.subscribeMessage === 'string'
            ? this.opts.subscribeMessage
            : JSON.stringify(this.opts.subscribeMessage);
        this.ws.send(msg);
      }
    };

    this.ws.onmessage = (event) => {
      const raw = typeof event.data === 'string' ? event.data : String(event.data);
      const value = this.opts.parse(raw);
      if (value !== null && Number.isFinite(value)) {
        this.emit({ timestamp: Date.now(), value });
      }
    };

    this.ws.onerror = () => {
      this.setStatus('error', new Error('WebSocket error'));
    };

    this.ws.onclose = () => {
      if (!this.stopped) this.scheduleReconnect();
    };
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer || this.stopped) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, this.opts.reconnectMs);
  }
}
