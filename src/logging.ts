import { Container, type Logger, format, transports } from 'winston';

import config from './config';

const { log } = config;
const { Console } = transports;
const { combine, prettyPrint, printf } = format;

const container = new Container();

export const getLogger = (category: string): Logger => {
  if (!container.has(category)) {
    container.add(category, {
      transports: [
        new Console({
          level: log.level,
          format: combine(
            prettyPrint(),
            printf((data) => `[${data.level}] ${data.message}`)
          )
        })
      ]
    });
  }

  return container.get(category);
};
