import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";
require("dotenv").config();

const ormConfigPostgres: PostgresConnectionOptions = {
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
    'dist/src/db/migrations/ws_sport/*.js',
  ],
  migrationsTableName: "ws_migration_table",
}

export default ormConfigPostgres;