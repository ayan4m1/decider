import type { SystemOneQuestion, SystemOneRequest } from 'ollama';

export type LogConfig = {
  level: string;
};

export type OllamaConfig = {
  baseUrl: string;
  bearerToken?: string;
  model: string;
};

export type AppConfig = {
  log: LogConfig;
  ollama: OllamaConfig;
};

export type DeciderRequest = Pick<SystemOneRequest, 'questions' | 'state'>;

export type DeciderQuestions = Record<string, SystemOneQuestion>;

export type ProgramOpts = {
  input: string;
  output: string;
  questions: string;
};
