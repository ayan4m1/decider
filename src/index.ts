import { existsSync } from 'node:fs';
import { appendFile, readFile, unlink, writeFile } from 'node:fs/promises';
import { program } from '@commander-js/extra-typings';
import chunk from 'lodash/chunk.js';

import config from './config.ts';
import { getLogger } from './logging.ts';
import { decide } from './ollama.ts';
import {
  InputFormats,
  type DeciderRequest,
  type DeciderResult
} from './types.ts';
import { loadQuestions, loadStates } from './utils.ts';

const log = getLogger('index');

const pkg = JSON.parse(
  await readFile(new URL('../package.json', import.meta.url), 'utf8')
) as { description: string; version: string };

program
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
  .option('-f, --force', 'Force overwrite the output file if it exists')
  .option(
    '--input-format <format>',
    'Input format (either jsonl or json_array)',
    'jsonl'
  )
  .option(
    '--output-format <format>',
    'Output format (either jsonl or json_array)',
    'jsonl'
  )
  .action(
    async ({
      input: inputPath,
      inputFormat,
      questions: questionsPath,
      output: outputPath,
      outputFormat,
      force
    }) => {
      try {
        if (inputPath === './states.jsonl' && inputFormat === 'json_array') {
          inputPath = './states.json';
        }

        if (outputPath === './scored.jsonl' && outputFormat === 'json_array') {
          outputPath = './scored.json';
        }

        const states = await loadStates(inputPath, inputFormat as InputFormats);
        const questions = await loadQuestions(questionsPath);

        if (existsSync(outputPath) && !force) {
          log.warn(`${outputPath} already exists, not overwriting it...`);
          process.exit(1);
        } else if (existsSync(outputPath)) {
          log.warn(`${outputPath} already exists, overwriting it...`);
          await unlink(outputPath);
        }

        const batches = chunk(states, config.concurrency);
        const results: DeciderResult[] = [];
        let processed = 0;

        for (const batch of batches) {
          const requests: DeciderRequest[] = batch.map((state) => ({
            state,
            questions
          }));
          const responses = await decide(requests);

          for (let j = 0; j < batch.length; j++) {
            const state = batch[j];
            const response = responses[j];
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const answers: any = {};

            for (const [key] of Object.entries(questions)) {
              const answer = response.answers[key];

              if (!answer) {
                continue;
              }

              answers[key] = answer;
            }

            processed++;
            log.info(
              `${processed} / ${states.length} (${((processed / states.length) * 1e2).toFixed(2)}%)`
            );
            log.debug(
              `State:\n\n${typeof state === 'string' ? state : JSON.stringify(state, null, 2)}\n\n`
            );
            log.debug(`Answers:\n\n${JSON.stringify(answers, null, 2)}\n\n`);

            const result: DeciderResult = {
              answers,
              questions,
              state
            };

            if (outputFormat === 'jsonl') {
              await appendFile(
                outputPath,
                `${JSON.stringify(result)}\n`,
                'utf8'
              );
            } else {
              results.push(result);
            }
          }
        }

        if (outputFormat === 'json_array') {
          await writeFile(outputPath, JSON.stringify(results), 'utf8');
        }
      } catch (error) {
        if (error instanceof Error) {
          log.error(error.message);
          log.error(error.stack);
        } else {
          log.error('Unknown error occurred!');
        }
      }
    }
  )
  .parse()
  .opts();
