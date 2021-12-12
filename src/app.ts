import { json } from 'body-parser';
import { merge } from 'config-plus';
import dotenv from 'dotenv';
import express from 'express';
import http from 'http';
import { connectToDb } from 'mongodb-extension';
import mysql from 'mysql';
import { config } from './config';
import { createContext } from './context';
import { route } from './route';

dotenv.config();
const conf = merge(config, process.env);

const app = express();
app.use(json());

if (conf.provider !== 'mongo') {
  const pool = mysql.createPool(conf.db);
  pool.getConnection((err, conn) => {
    if (err) {
      console.error('Failed to connect to MySQL.', err.message, err.stack);
    }
    if (conn) {
      console.log('Connected successfully to MySQL.');
      const ctx = createContext(pool, conf);
      route(app, ctx);
      http.createServer(app).listen(conf.port, () => {
        console.log('Start server at port ' + conf.port);
      });
    }
  });
} else {
  connectToDb(`${conf.mongo.uri}`, `${conf.mongo.db}`).then(db => {
    const ctx = createContext(db, conf);
    route(app, ctx);
    http.createServer(app).listen(conf.port, () => {
      console.log('Start mongo server at port ' + conf.port);
    });
  }).catch(err => console.log('Cannot connect to mongo: ' + err));
}
