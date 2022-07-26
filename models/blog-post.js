import { DataTypes } from "sequelize";
import db from "../db/db.js";
import Comment from "./comment.js";
import User from "./user.js";

const BlogPost = db.define("BlogPost", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  datePosted: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: "id",
    },
  },
});

BlogPost.hasMany(Comment, {
  as: "comments",
  foreignKey: { name: "blogPostId" },
});

export default BlogPost;
