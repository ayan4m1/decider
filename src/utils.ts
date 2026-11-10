import { readFile } from 'node:fs/promises';
import { type SystemOneContent } from 'ollama';
import { createReadStream, existsSync } from 'node:fs';
import { createInterface } from 'node:readline/promises';

import type { DeciderQuestions, InputFormats } from './types';

async function loadJsonl<T>(filePath: string) {
  const rl = createInterface({
    input: createReadStream(filePath),
    crlfDelay: Infinity
  });

  const results: T[] = [];

  for await (const line of rl) {
    const trimmed = line?.trim();

    if (trimmed) {
      results.push(JSON.parse(trimmed) as T);
    }
  }

  return results;
}

export const loadStates = async (path: string, inputFormat: InputFormats) => {
  if (!existsSync(path)) {
    throw new Error(`No data at location ${path}!`);
  }

  if (inputFormat === 'jsonl') {
    return loadJsonl<SystemOneContent>(path);
  }

  return JSON.parse(
    await readFile(path, 'utf8')
  ) as unknown as SystemOneContent[];
};

export const loadQuestions = async (path: string) => {
  if (!existsSync(path)) {
    throw new Error(`No questions at location ${path}!`);
  }

  return JSON.parse(await readFile(path, 'utf8')) as DeciderQuestions;
};
