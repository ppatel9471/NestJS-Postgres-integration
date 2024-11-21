import { DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

export const databaseConfig: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'mathwhiz_user',
  password: process.env.DB_PASSWORD || 'your_password',
  database: process.env.DB_NAME || 'mathwhiz_db',
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: ['dist/migrations/*{.ts,.js}'],
  migrationsTableName: 'migrations_history',
  synchronize: false,
  logging: process.env.NODE_ENV !== 'production',
};
