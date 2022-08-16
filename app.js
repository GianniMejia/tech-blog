import express from "express";
import { engine } from "express-handlebars";
import "dotenv/config";
import db from "./db/db.js";
import bcrypt from "bcrypt";
import session from "express-session";
import connect from "connect-session-sequelize";
import User from "./models/user.js";
import BlogPost from "./models/blog-post.js";
import Comment from "./models/comment.js";

const app = express();

// Update the schema.
db.sync({ alter: true });

// connect(session.Store).use(
//   connect.session({
//     store: new SequelizeStore(options),
//     secret: process.env.SESSION_SECRET,
//   })
// );

// Set up session middleware
const SequelizeStore = connect(session.Store);

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    store: new SequelizeStore({
      db: db,
    }),
    resave: false, // we support the touch method so per the express-session docs this should be set to false
    proxy: true, // if you do SSL outside of node.
  })
);

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

app.post("/api/signup", async (req, res) => {
  try {
    if (req.session.userId) {
      res.redirect("/");
      return;
    }

    if (!req.body.username) {
      res.status(400).send({ message: "Please enter a username." });
      return;
    }

    if (!req.body.password) {
      res.status(400).send({ message: "Please enter a password." });
      return;
    }

    if (await User.findOne({ where: { username: req.body.username } })) {
      res.status(400).send({ message: "That username is taken." });
      return;
    }

    const user = await User.create({
      ...req.body,
      passwordHash: await bcrypt.hash(req.body.password, 1),
    });

    // Save user data in session (log them in)
    req.session.userId = user.id;
    req.session.save();
  } catch (error) {
    res.status(500).send({ message: "Something went wrong." });
    console.log(error);
  }
});

app.listen(3002, () => console.log("server running."));
