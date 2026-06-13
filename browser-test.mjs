import { setupBrowserRuntime } from 'file:///C:/Users/Rezio/.codex/plugins/cache/openai-bundled/browser/26.602.71036/scripts/browser-client.mjs';
await setupBrowserRuntime({ globals: globalThis });
console.log('Browser runtime setup complete');
console.log('agent available:', typeof globalThis.agent);
