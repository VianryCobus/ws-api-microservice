import { MysqlConnectionOptions } from "typeorm/driver/mysql/MysqlConnectionOptions";
import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";
require("dotenv").config();

const ormConfig: PostgresConnectionOptions = {
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT),
  username: process.env.POSTGRES_USERNAME,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DATABASE,
  entities: ['dist/src/models/**/*.entity.js'],
  synchronize: false,
  logging: false,
  logger: 'file',
  migrations: [
    'dist/src/db/migrations/*.js',
  ],
  migrationsTableName: "ws_migration_table",
  // cli: {
  //   migrationsDir: 'src/db/migrations'
  // }
}

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

export {
  ormConfig,
  mysqlHlConfig,
  mysqlCobsConfig,
};