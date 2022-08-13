import { Sequelize } from "sequelize";
const db = new Sequelize("tech_blog", "root", process.env.MYSQL_PASSWORD, {
  host: "localhost",
  dialect: "mysql",
});

export default db;
