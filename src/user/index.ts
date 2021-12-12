import { Db } from 'mongodb';
import { buildQuery, SearchBuilder as MongoSearchBuilder } from 'mongodb-extension';
import { Manager, SearchResult } from 'onecore';
import { DB, SearchBuilder } from 'query-core';
import { User, UserFilter, userModel, UserRepository, UserService } from './user';
import { UserController } from './user-controller';
export * from './user';
export { UserController };

import { MongoUserRepository } from './mongo-user-repository';
import { SqlUserRepository } from './sql-user-repository';

export class UserManager extends Manager<User, string, UserFilter> implements UserService {
  constructor(find: (s: UserFilter, limit?: number, offset?: number | string, fields?: string[]) => Promise<SearchResult<User>>, repository: UserRepository) {
    super(find, repository);
  }
}
export function useUser(ds: DB | Db, provider?: string): UserService {
  if (provider !== 'mongo') {
    const db = ds as DB;
    const builder = new SearchBuilder<User, UserFilter>(db.query, 'users', userModel.attributes, db.driver);
    const repository = new SqlUserRepository(db as DB);
    return new UserManager(builder.search, repository);
  } else {
    const db = ds as Db;
    const builder = new MongoSearchBuilder<User, UserFilter>(db, 'users', buildQuery, userModel.attributes);
    const repository = new MongoUserRepository(db as Db);
    return new UserManager(builder.search, repository);
  }
}
export function useUserController(log: (msg: string) => void, db: DB | Db, provider?: string): UserController {
  return new UserController(log, useUser(db, provider));
}
