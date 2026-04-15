import { registry } from '../core/DataSourceRegistry';
import { HttpPollingSource } from './HttpPollingSource';
import { RandomWalkSource } from './RandomWalkSource';
import { WebSocketSource } from './WebSocketSource';

export { HttpPollingSource } from './HttpPollingSource';
export { RandomWalkSource } from './RandomWalkSource';
export { WebSocketSource } from './WebSocketSource';

/**
 * Default sources registered at boot. Add new ones here (or call
 * `registry.register` from anywhere in the app) and the dashboard picks
 * them up automatically.
 */
export function registerDefaultSources(): void {
  registry.register(
    new RandomWalkSource(
      {
        id: 'cpu-demo',
        name: 'CPU (demo)',
        description: 'Simulated CPU load',
        unit: '%',
        color: '#7c5cff',
      },
      { intervalMs: 1000, start: 45, volatility: 6 },
    ),
  );

  registry.register(
    new RandomWalkSource(
      {
        id: 'latency-demo',
        name: 'Latency (demo)',
        description: 'Simulated p95 latency',
        unit: 'ms',
        color: '#3ec1ff',
      },
      { intervalMs: 1500, start: 120, volatility: 20, min: 20, max: 500 },
    ),
  );

  registry.register(
    new RandomWalkSource(
      {
        id: 'rps-demo',
        name: 'Requests / s (demo)',
        description: 'Simulated throughput',
        unit: 'req/s',
        color: '#2fd687',
      },
      { intervalMs: 800, start: 200, volatility: 30, min: 0, max: 1000 },
    ),
  );

  // Example real sources (disabled by default — provide URLs and uncomment):
  //
  // registry.register(
  //   new HttpPollingSource(
  //     { id: 'btc-price', name: 'BTC / USD', unit: '$', color: '#f7a531' },
  //     {
  //       url: 'https://api.coinbase.com/v2/prices/BTC-USD/spot',
  //       intervalMs: 5000,
  //       parse: (json: any) => parseFloat(json?.data?.amount),
  //     },
  //   ),
  // );
  //
  // registry.register(
  //   new WebSocketSource(
  //     { id: 'btc-trade', name: 'BTC trades', unit: '$', color: '#f7a531' },
  //     {
  //       url: 'wss://ws-feed.exchange.coinbase.com',
  //       subscribeMessage: {
  //         type: 'subscribe',
  //         product_ids: ['BTC-USD'],
  //         channels: ['ticker'],
  //       },
  //       parse: (raw: string) => {
  //         const msg = JSON.parse(raw);
  //         return msg.type === 'ticker' ? parseFloat(msg.price) : null;
  //       },
  //     },
  //   ),
  // );
}

// Re-export for consumer convenience.
export { registry };
