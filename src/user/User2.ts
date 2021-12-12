import { DateRange, Filter, Model, ResultInfo, Service } from 'onecore';

export interface UserFilter extends Filter {
  id: string;
  username: string;
  email?: string;
  phone?: string;
  dateOfBirth?: Date|DateRange;
}
export interface User {
  id: string;
  username: string;
  email?: string;
  phone?: string;
  dateOfBirth?: Date;
}
export interface UserService extends Service<User, string, number | ResultInfo<User>, UserFilter> {
}

export const userModel: Model = {
  name: 'user',
  source: 'users',
  attributes: {
    id: {
      key: true,
      length: 40
    },
    username: {
      required: true,
      length: 255
    },
    email: {
      format: 'email',
      required: true,
      length: 120
    },
    phone: {
      format: 'phone',
      required: true,
      length: 14
    },
    dateOfBirth: {
      type: 'datetime'
    }
  }
};
