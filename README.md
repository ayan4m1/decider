# Decider

This is a CLI application designed to help you process bulk datasets with a System One decision model.

## Usage

Run the following:

```sh
git clone https://github.com/ayan4m1/decider.git
cd decider
corepack enable
yarn install
npm run build
cp .env.default .env
```

Configure `.env` for your desired Ollama instance and model.

Your data should be in a JSONL file (default `states.jsonl`), where each line is a JSON string or object representing the state to be passed to the decision model.

Your questions should be in a JSON file (default `questions.json`). See `questions.example.json` for an example of how to structure the three question types (choice, score, and noul). See [TypeSafe documentation](https://docs.typesafe.ai/primitives) for more information on the question types.

Run `node lib/index.js` to start processing. Results will be written to a JSONL file (default `scored.jsonl`), with the rows in the same order as the input document.

### Options

| Option                   | Description                      | Default            |
| ------------------------ | -------------------------------- | ------------------ |
| `-i, --input <path>`     | JSONL file of states to evaluate | `./states.jsonl`   |
| `-q, --questions <path>` | JSON file of questions to ask    | `./questions.json` |
| `-o, --output <path>`    | JSONL file to write results to   | `./scored.jsonl`   |

## Roadmap

- Optional batch processing
