import { HealthController, LogController, resources } from 'express-ext';
import { JSONLogger, LogConfig, map } from 'logger-core';
import { Db } from 'mongodb';
import { buildQuery, MongoChecker, SearchBuilder as MongoSearchBuilder } from 'mongodb-extension';
import { Pool } from 'mysql';
import { MySQLChecker, param, PoolManager } from 'mysql-core';
import { mysql, SearchBuilder } from 'query-core';
import { createValidator } from 'xvalidators';
import { MongoUserService, SqlUserService, User, UserController, UserFilter, userModel } from './user';

resources.createValidator = createValidator;

export interface Config {
  log: LogConfig;
}
export interface ApplicationContext {
  health: HealthController;
  log: LogController;
  user: UserController;
}
export function createContext(provider: string|undefined, db: Pool|Db, conf: Config): ApplicationContext {
  const logger = new JSONLogger(conf.log.level, conf.log.map);
  const log = new LogController(logger, map);

  if (provider !== 'mongo') {
    const pool: Pool = db as Pool;
    const sqlChecker = new MySQLChecker(pool);
    const health = new HealthController([sqlChecker]);
    const manager = new PoolManager(pool);

    const userSearchBuilder = new SearchBuilder<User, UserFilter>(manager.query, 'users', userModel.attributes, mysql);
    const userService = new SqlUserService(userSearchBuilder.search, param, manager.query, manager.exec);
    const user = new UserController(logger.error, userService);

    return { health, log, user };
  } else {
    const mongoDb: Db = db as Db;
    const mongoChecker = new MongoChecker(mongoDb);
    const health = new HealthController([mongoChecker]);

    const userSearchBuilder = new MongoSearchBuilder<User, UserFilter>(mongoDb, 'users', buildQuery, userModel.attributes);
    const userService = new MongoUserService(userSearchBuilder.search, mongoDb);
    const user = new UserController(logger.error, userService);

    return { health, log, user };
  }
}
