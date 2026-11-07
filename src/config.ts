import type { AppConfig } from './types.ts';

try {
  process.loadEnvFile();
} catch {
  // no .env on disk - fall back to the ambient environment
}

const config: AppConfig = {
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
