import { Db } from 'mongodb';
import { Service } from 'mongodb-extension';
import { SearchResult } from 'onecore';
import { User, UserFilter, userModel } from './user';

export class MongoUserService extends Service<User, string, UserFilter> {
  constructor(find: (s: UserFilter, limit?: number, offset?: number | string, fields?: string[]) => Promise<SearchResult<User>>, db: Db) {
    super(find, db, 'users', userModel.attributes);
  }
}
