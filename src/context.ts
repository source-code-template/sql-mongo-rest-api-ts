import { HealthController, LogController, resources } from 'express-ext';
import { JSONLogger, LogConfig, map } from 'logger-core';
import { Db } from 'mongodb';
import { MongoChecker } from 'mongodb-extension';
import { createChecker, DB } from 'query-core';
import { createValidator } from 'xvalidators';
import { UserController, useUserController } from './user';

resources.createValidator = createValidator;

export interface Config {
  provider?: string;
  log: LogConfig;
}
export interface ApplicationContext {
  health: HealthController;
  log: LogController;
  user: UserController;
}
export function useContext(db: DB|Db, conf: Config): ApplicationContext {
  const logger = new JSONLogger(conf.log.level, conf.log.map);
  const log = new LogController(logger, map);
  let health: HealthController;

  if (conf.provider !== 'mongo') {
    const sqlChecker = createChecker(db as DB);
    health = new HealthController([sqlChecker]);
  } else {
    const mongoChecker = new MongoChecker(db as Db);
    health = new HealthController([mongoChecker]);
  }

  const user = useUserController(logger.error, db, conf.provider);
  return { health, log, user };
}
