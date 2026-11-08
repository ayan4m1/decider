import type { AppConfig } from './types.ts';

try {
  process.loadEnvFile();
} catch {
  // no .env on disk - fall back to the ambient environment
}

const config: AppConfig = {
  concurrency: Math.max(
    1,
    parseInt(process.env.DECIDER_CONCURRENCY ?? '', 10) || 1
  ),
  log: {
    level: process.env.DECIDER_LOG_LEVEL || 'info'
  },
  ollama: {
    baseUrl: process.env.DECIDER_OLLAMA_BASE_URL || 'http://127.0.0.1:11434',
    bearerToken: process.env.DECIDER_OLLAMA_BEARER_TOKEN,
    model: process.env.DECIDER_OLLAMA_MODEL || 'invalid'
  }
};

export default config;
