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

app.get("/", async (req, res) => {
  res.render("home", {
    posts: (
      await BlogPost.findAll({
        raw: true,
        order: [["datePosted", "DESC"]],
      })
    ).map((post) => ({
      ...post,
      datePosted: post.datePosted.toLocaleString("en-US"),
    })),
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

    res.redirect("/");
  } catch (error) {
    res.status(500).send({ message: "Something went wrong." });
    console.log(error);
  }
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/api/login", async (req, res) => {
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

    const user = await User.findOne({ where: { username: req.body.username } });

    if (!user) {
      res.status(400).send({ message: "Invalid username/password." });
      return;
    }

    if (!bcrypt.compare(req.body.password, user.passwordHash)) {
      res.status(400).send({ message: "Invalid username/password." });
      return;
    }

    // Save user data in session (log them in)
    req.session.userId = user.id;
    req.session.save();

    res.redirect("/");
  } catch (error) {
    res.status(500).send({ message: "Something went wrong." });
    console.log(error);
  }
});

app.get("/api/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

app.get("/api/current-user", async (req, res) => {
  try {
    if (!req.session.userId) {
      res.status(200).send("null");
      return;
    }

    res
      .status(200)
      .send(await User.findOne({ where: { id: req.session.userId } }));
  } catch (error) {
    res.status(500).send({ message: "Something went wrong." });
    console.log(error);
  }
});

app.get("/dashboard", (req, res) => {
  if (!req.session.userId) {
    res.redirect("/login");
    return;
  }
  res.render("dashboard");
});

app.get("/post/:id", async (req, res) => {
  const post = (
    await BlogPost.findByPk(req.params.id, {
      include: [
        {
          model: Comment,
          as: "comments",
          include: [{ model: User, as: "user" }],
        },
      ],
    })
  ).get({ plain: true });

  res.render("post", {
    post: {
      ...post,
      comments: post.comments.map((comment) => ({
        ...comment,
        datePosted: comment.datePosted.toLocaleString("en-US"),
      })),
      datePosted: post.datePosted.toLocaleString("en-US"),
    },
  });
});

app.post("/api/comment", async (req, res) => {
  try {
    if (!req.session.userId) {
      res.status(403).send({ message: "Please login to do that." });
      return;
    }

    if (!req.body.content) {
      res.status(400).send({ message: "Please enter a comment." });
      return;
    }

    await Comment.create({
      ...req.body,
      datePosted: new Date(),
      userId: req.session.userId,
    });

    res.redirect("back");
  } catch (error) {
    res.status(500).send({ message: "Something went wrong." });
    console.log(error);
  }
});

app.listen(3002, () => console.log("server running."));
