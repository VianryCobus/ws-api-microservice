import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";
require("dotenv").config();

const ormConfig: PostgresConnectionOptions = {
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: parseInt(<string>process.env.POSTGRES_PORT),
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
  // cli: {
  //   migrationsDir: 'src/db/migrations'
  // }
}

export default ormConfig;