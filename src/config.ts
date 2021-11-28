export const config = {
  port: 8080,
  log: {
    level: 'info',
    map: {
      time: '@timestamp',
      msg: 'message'
    }
  },
  provider: 'mongo',
  db: {
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: 'abcd1234',
    database: 'masterdata',
    multipleStatements: true,
  },
  mongo: {
    uri: 'mongodb+srv://dbUser:Demoaccount1@projectdemo.g0lah.mongodb.net',
    db: 'masterdata'
  }
};
