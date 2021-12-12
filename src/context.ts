import { HealthController, LogController, resources } from 'express-ext';
import { JSONLogger, LogConfig, map } from 'logger-core';
import { Db } from 'mongodb';
import { MongoChecker } from 'mongodb-extension';
import { Pool } from 'mysql';
import { MySQLChecker, PoolManager } from 'mysql-core';
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
export function createContext(ds: Pool|Db, conf: Config): ApplicationContext {
  const logger = new JSONLogger(conf.log.level, conf.log.map);
  const log = new LogController(logger, map);

  if (conf.provider !== 'mongo') {
    const pool: Pool = ds as Pool;
    const sqlChecker = new MySQLChecker(pool);
    const health = new HealthController([sqlChecker]);
    const db = new PoolManager(pool);

    const user = useUserController(logger.error, db, conf.provider);
    return { health, log, user };
  } else {
    const db: Db = ds as Db;
    const mongoChecker = new MongoChecker(db);
    const health = new HealthController([mongoChecker]);

    const user = useUserController(logger.error, db, conf.provider);
    return { health, log, user };
  }
}
