import bcrypt from "bcrypt";
import db from "./db.js";
import User from "../models/user.js";
import BlogPost from "../models/blog-post.js";
import Comment from "../models/comment.js";

(async () => {
  await User.bulkCreate([
    {
      username: "user1",
      passwordHash: await bcrypt.hash("password123", 1),
    },
  ]);

  await BlogPost.bulkCreate([
    {
      title: "My First Post",
      content: "My first post is about JavaScript. It's fun.",
      datePosted: new Date(),
      userId: 1,
    },
    {
      title: "My Second Post",
      content: "My second post is about HTML. It's fun.",
      datePosted: new Date(),
      userId: 1,
    },
  ]);

  await Comment.bulkCreate([
    {
      content: "Comment 1",
      datePosted: new Date(),
      userId: 1,
      blogPostId: 1,
    },
    {
      content: "Comment 2",
      datePosted: new Date(),
      userId: 1,
      blogPostId: 1,
    },
  ]);
})();
