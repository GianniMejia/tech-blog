import { DataTypes } from "sequelize";
import db from "../db/db.js";
// import BlogPost from "./blog-post.js";
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
  // userId: {
  //   type: DataTypes.INTEGER,
  //   allowNull: false,
  //   references: {
  //     model: User,
  //     key: "id",
  //   },
  // },
  // blogPostId: {
  //   type: DataTypes.INTEGER,
  //   allowNull: false,
  //   references: {
  //     model: BlogPost,
  //     key: "id",
  //   },
  // },
});

Comment.belongsTo(User, {
  as: "user",
  foreignKey: { name: "userId" },
});

export default Comment;
