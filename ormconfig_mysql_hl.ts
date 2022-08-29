import { MysqlConnectionOptions } from "typeorm/driver/mysql/MysqlConnectionOptions";
require("dotenv").config();

const mysqlHlConfig: MysqlConnectionOptions = {
  name: 'mysqlHlConnection',
  type: "mysql",
  host: process.env.MYSQL_HL_HOST,
  port: Number(process.env.MYSQL_HL_PORT),
  username: process.env.MYSQL_HL_USERNAME,
  password: process.env.MYSQL_HL_PASSWORD,
  database: process.env.MYSQL_HL_DATABASE,
  entities: [
    'dist/src/models/models_hl/**/*.entity.js'
  ],
  synchronize: false,
}

export default mysqlHlConfig;