import { Sequelize } from "sequelize";
import "dotenv/config";

const db = process.env.JAWSDB_URL
  ? new Sequelize(process.env.JAWSDB_URL)
  : new Sequelize("tech_blog", "root", process.env.MYSQL_PASSWORD, {
      host: "localhost",
      dialect: "mysql",
    });

export default db;
