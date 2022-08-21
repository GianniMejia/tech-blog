import db from "./db.js";
import User from "../models/user.js";
import BlogPost from "../models/blog-post.js";
import Comment from "../models/comment.js";

(async () => {
  await db.sync({ alter: true });
})();
