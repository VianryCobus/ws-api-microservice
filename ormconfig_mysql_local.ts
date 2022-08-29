import { MysqlConnectionOptions } from "typeorm/driver/mysql/MysqlConnectionOptions";
require("dotenv").config();

const mysqlCobsConfig: MysqlConnectionOptions = {
  name: 'mysqlLocalConnection',
  type: "mysql",
  host: "127.0.0.1",
  port: 3306,
  username: "root",
  password: "root",
  database: "gamexyz",
  entities: [
    'dist/src/models/models_mysqlLocal/**/*.entity.js'
  ],
  synchronize: false,
}

export default mysqlCobsConfig;