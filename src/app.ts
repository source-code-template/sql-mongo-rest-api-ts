import { json } from 'body-parser';
import { merge } from 'config-plus';
import dotenv from 'dotenv';
import express from 'express';
import http from 'http';
import { connectToDb } from 'mongodb-extension';
import mysql from 'mysql';
import { PoolManager } from 'mysql-core';
import { config, env } from './config';
import { useContext } from './context';
import { route } from './route';

dotenv.config();
const conf = merge(config, process.env, env, process.env.ENV);

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
      const db = new PoolManager(pool);
      const ctx = useContext(db, conf);
      route(app, ctx);
      http.createServer(app).listen(conf.port, () => {
        console.log('Start server at port ' + conf.port);
      });
    }
  });
} else {
  connectToDb(`${conf.mongo.uri}`, `${conf.mongo.db}`).then(db => {
    const ctx = useContext(db, conf);
    route(app, ctx);
    http.createServer(app).listen(conf.port, () => {
      console.log('Start server at port ' + conf.port);
    });
  }).catch(err => console.log('Cannot connect to mongo: ' + err));
}
