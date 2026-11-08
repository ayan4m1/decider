import { Ollama } from 'ollama';

import config from './config';
import type { DeciderRequest } from './types';

const { ollama } = config;

const client = new Ollama({
  headers: ollama.bearerToken
    ? {
        Authorization: `Bearer ${ollama.bearerToken}`
      }
    : undefined,
  host: ollama.baseUrl
});

export const decide = (reqs: DeciderRequest[]) =>
  Promise.all(
    reqs.map((req) =>
      client.systemone({
        model: ollama.model,
        questions: req.questions,
        state: req.state
      })
    )
  );
