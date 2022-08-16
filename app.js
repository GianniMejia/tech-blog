import express from "express";
import { engine } from "express-handlebars";
import "dotenv/config";
import db from "./db/db.js";
import User from "./models/user.js";
import BlogPost from "./models/blog-post.js";
import Comment from "./models/comment.js";

// Update the schema.
db.sync();

const app = express();

app.use(express.json());

app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", "./views");

app.get("/", (req, res) => {
  res.render("home", {
    posts: [
      {
        id: 1,
        title: "Post 1",
        postDate: new Date(),
        content: "This is the first test post.",
      },
      {
        id: 2,
        title: "Post 2",
        postDate: new Date(),
        content: "This is the second test post.",
      },
    ],
  });
});

app.get("/signup", (req, res) => {
  res.render("signup");
});

app.get("/api/signup", (req, res) => {
  console.log("body: ", req.body);
  // TODO: Insert the new user into the database
  res.status(500).send("test");
});

app.listen(3002, () => console.log("server running."));
