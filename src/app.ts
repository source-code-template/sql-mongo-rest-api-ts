import { json } from 'body-parser';
import dotenv from 'dotenv';
import express from 'express';
import http from 'http';
import { connectToDb } from 'mongodb-extension';
import mysql from 'mysql';
import { createContext } from './context';
import { route } from './route';

dotenv.config();

const app = express();

const provider: string | undefined = process.env.PROVIDER;
const port = process.env.PORT;

app.use(json());

if (provider !== 'mongo') {
  const password = process.env.PASSWORD;
  const pool = mysql.createPool({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password,
    database: 'masterdata',
    multipleStatements: true,
  });
  pool.getConnection((err, conn) => {
    if (err) {
      console.error('Failed to connect to MySQL.', err.message, err.stack);
    }
    if (conn) {
      const ctx = createContext(provider, pool);
      route(app, ctx);
      http.createServer(app).listen(port, () => {
        console.log('Start server at port ' + port);
      });
      console.log('Connected successfully to MySQL.');
    }
  });
} else {
  const mongoURI = process.env.MONGO_URI;
  const mongoDB = process.env.MONGO_DB;
  connectToDb(`${mongoURI}`, `${mongoDB}`).then(db => {
    const ctx = createContext(provider, db);
    route(app, ctx);
    http.createServer(app).listen(port, () => {
      console.log('Start mongo server at port ' + port);
    });
  });
}
