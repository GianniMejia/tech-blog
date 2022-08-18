import { DataTypes } from "sequelize";
import db from "../db/db.js";
import User from "./user.js";

const Comment = db.define("Comment", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  content: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  datePosted: {
    type: DataTypes.DATE,
    allowNull: false,
  },
});

Comment.belongsTo(User, {
  as: "user",
  foreignKey: { name: "userId" },
});

export default Comment;
