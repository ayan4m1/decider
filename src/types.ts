import type {
  SystemOneContent,
  SystemOneQuestion,
  SystemOneRequest
} from 'ollama';

export const InputFormats = {
  JsonLines: 'jsonl',
  JsonArray: 'json_array'
} as const;

export type InputFormats = (typeof InputFormats)[keyof typeof InputFormats];

export type LogConfig = {
  level: string;
};

export type OllamaConfig = {
  baseUrl: string;
  bearerToken?: string;
  model: string;
};

export type AppConfig = {
  concurrency: number;
  log: LogConfig;
  ollama: OllamaConfig;
};

export type DeciderRequest = Pick<SystemOneRequest, 'questions' | 'state'>;

export type DeciderQuestions = Record<string, SystemOneQuestion>;

export type DeciderResult = {
  answers: Record<string, unknown>;
  questions: DeciderQuestions;
  state: SystemOneContent;
};
