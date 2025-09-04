import { SQLDatabase } from 'encore.dev/storage/sqldb';

export const jewelryDB = new SQLDatabase("jewelry", {
  migrations: "./migrations",
});
