import { DataSource } from './DataSource';

/**
 * Singleton registry of available data sources.
 *
 * Adding a new source to the app is a one-liner:
 *
 *   registry.register(new MyCustomSource({ ... }));
 *
 * The dashboard re-renders when the registry changes so new sources show up
 * live without any other wiring.
 */
class DataSourceRegistry {
  private sources = new Map<string, DataSource>();
  private listeners = new Set<() => void>();

  register(source: DataSource): void {
    if (this.sources.has(source.metadata.id)) {
      // Replace (useful for hot-reload during dev).
      const existing = this.sources.get(source.metadata.id)!;
      void existing.stop();
    }
    this.sources.set(source.metadata.id, source);
    this.notify();
  }

  unregister(id: string): void {
    const existing = this.sources.get(id);
    if (!existing) return;
    void existing.stop();
    this.sources.delete(id);
    this.notify();
  }

  get(id: string): DataSource | undefined {
    return this.sources.get(id);
  }

  list(): DataSource[] {
    return Array.from(this.sources.values());
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((l) => l());
  }
}

export const registry = new DataSourceRegistry();
