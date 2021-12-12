import { Db } from 'mongodb';
import { buildQuery, SearchBuilder as MongoSearchBuilder } from 'mongodb-extension';
import { DB, SearchBuilder } from 'query-core';
import { User, UserFilter, userModel, UserService } from './user';
import { UserController } from './UserController';
export * from './user';
export { UserController };

import { MongoUserService } from './MongoUserService';
import { SqlUserService } from './SqlUserService';

export function useUser(ds: DB | Db, provider?: string): UserService {
  if (provider !== 'mongo') {
    const db = ds as DB;
    const builder = new SearchBuilder<User, UserFilter>(db.query, 'users', userModel.attributes, db.driver);
    return new SqlUserService(builder.search, db as DB);
  } else {
    const db = ds as Db;
    const builder = new MongoSearchBuilder<User, UserFilter>(db, 'users', buildQuery, userModel.attributes);
    return new MongoUserService(builder.search, db as Db);
  }
}
export function useUserController(log: (msg: string) => void, db: DB | Db, provider?: string): UserController {
  return new UserController(log, useUser(db, provider));
}
