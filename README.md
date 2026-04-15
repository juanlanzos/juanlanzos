# Realtime Stats — App modular para tu teléfono

App React Native (Expo) que muestra estadísticas en tiempo real desde
**cualquier fuente de datos** que le conectes. Diseñada para que agregar
una nueva fuente sea una sola línea de código.

## Cómo correrla

```bash
npm install
npm start          # abre Expo DevTools
npm run ios        # simulador iOS
npm run android    # emulador Android
npm run web        # en el navegador
```

Instala la app **Expo Go** en tu teléfono y escanea el QR que te muestra
`npm start` para probarla en el dispositivo real.

## Arquitectura

```
src/
├── core/
│   ├── DataSource.ts            # Interfaz + BaseDataSource
│   ├── DataSourceRegistry.ts    # Registro global de fuentes
│   └── useDataSource.ts         # Hooks de React
├── sources/
│   ├── RandomWalkSource.ts      # Demo (random walk)
│   ├── HttpPollingSource.ts     # REST polling
│   ├── WebSocketSource.ts       # Streaming por WebSocket
│   └── index.ts                 # Registro de fuentes por defecto
├── components/
│   ├── StatCard.tsx             # Tarjeta con valor + sparkline
│   └── Sparkline.tsx            # Gráfico SVG minimalista
└── screens/
    └── DashboardScreen.tsx      # UI principal
```

La clave es `DataSource`: cualquier objeto que cumpla esa interfaz —
polling HTTP, WebSocket, MQTT, BLE, sensores del teléfono, lo que sea —
encaja en el dashboard sin tocar la UI.

## Agregar una nueva fuente de datos

### Opción A — HTTP polling

```ts
import { registry } from './src/core/DataSourceRegistry';
import { HttpPollingSource } from './src/sources/HttpPollingSource';

registry.register(
  new HttpPollingSource(
    { id: 'temp', name: 'Temperatura', unit: '°C', color: '#3ec1ff' },
    {
      url: 'https://mi-api.com/sensor/temp',
      intervalMs: 2000,
      parse: (json: any) => json.celsius,
    },
  ),
);
```

### Opción B — WebSocket

```ts
import { WebSocketSource } from './src/sources/WebSocketSource';

registry.register(
  new WebSocketSource(
    { id: 'trades', name: 'Trades', unit: '$', color: '#f7a531' },
    {
      url: 'wss://stream.miexchange.com/ticker',
      subscribeMessage: { type: 'subscribe', symbol: 'BTCUSD' },
      parse: (raw) => {
        const msg = JSON.parse(raw);
        return msg.type === 'price' ? msg.value : null;
      },
    },
  ),
);
```

### Opción C — Fuente personalizada

Extiende `BaseDataSource` y ya tienes listeners, status y reconnect
gratis:

```ts
import { BaseDataSource } from './src/core/DataSource';

export class SensorSource extends BaseDataSource {
  private subscription?: { remove: () => void };

  start() {
    this.setStatus('running');
    this.subscription = someSensor.listen((v) => {
      this.emit({ timestamp: Date.now(), value: v });
    });
  }

  stop() {
    this.subscription?.remove();
    this.setStatus('stopped');
  }
}
```

Luego `registry.register(new SensorSource({...}))` y aparece en el
dashboard al instante — el registry notifica a la UI.

## Contrato de `DataSource`

| Método / propiedad | Qué hace |
|---|---|
| `metadata` | `{ id, name, description?, unit?, color? }` |
| `status` | `idle` · `connecting` · `running` · `error` · `stopped` |
| `start()` | Arranca la fuente (idempotente) |
| `stop()` | Para y libera recursos |
| `onData(cb)` | Recibe `{ timestamp, value, meta? }`; devuelve unsubscribe |
| `onStatus(cb)` | Cambios de estado; devuelve unsubscribe |

## Próximos pasos sugeridos

- Persistir histórico con `expo-sqlite` o `AsyncStorage`
- Agrupar fuentes en tableros / pestañas
- Notificaciones push cuando una métrica cruza un umbral
- Export a CSV / share sheet
