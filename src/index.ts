import { existsSync } from 'node:fs';
import { appendFile, readFile } from 'node:fs/promises';
import { program } from '@commander-js/extra-typings';

import { getLogger } from './logging.ts';
import { decide } from './ollama.ts';
import type { DeciderRequest } from './types.ts';
import { loadQuestions, loadStates } from './utils.ts';

const log = getLogger('index');

const pkg = JSON.parse(
  await readFile(new URL('../package.json', import.meta.url), 'utf8')
) as { description: string; version: string };

const {
  input: statePath,
  questions: questionPath,
  output: outputPath
} = program
  .name('decider')
  .description(pkg.description)
  .version(pkg.version)
  .option(
    '-i, --input <path>',
    'JSONL file of states to evaluate',
    './states.jsonl'
  )
  .option(
    '-q, --questions <path>',
    'JSON file of questions to ask',
    './questions.json'
  )
  .option(
    '-o, --output <path>',
    'JSONL file to write results to',
    './scored.jsonl'
  )
  .parse()
  .opts();

try {
  const states = await loadStates(statePath);
  const questions = await loadQuestions(questionPath);

  if (existsSync(outputPath)) {
    log.warning(`${outputPath} already exists, not overwriting it...`);
    process.exit(1);
  }

  for (let i = 0; i < states.length; i++) {
    const state = states[i];
    const request: DeciderRequest = { state, questions };
    const response = await decide(request);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const answers: any = {};

    for (const [key] of Object.entries(questions)) {
      const answer = response.answers[key];

      if (!answer) {
        continue;
      }

      answers[key] = answer;
    }

    log.info(
      `${i} / ${states.length} (${((i / states.length) * 1e2).toFixed(2)}%)`
    );
    log.debug(
      `State:\n\n${typeof state === 'string' ? state : JSON.stringify(state, null, 2)}\n\n`
    );
    log.debug(`Answers:\n\n${JSON.stringify(answers, null, 2)}\n\n`);

    appendFile(
      outputPath,
      `${JSON.stringify({
        answers,
        questions,
        state
      })}\n`,
      'utf8'
    );
  }
} catch (error) {
  if (error instanceof Error) {
    log.error(error.message);
    log.error(error.stack);
  } else {
    log.error('Unknown error occurred!');
  }
}
