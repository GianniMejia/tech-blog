import express from "express";
import { engine } from "express-handlebars";
import "dotenv/config";
import db from "./db/db.js";
import session from "express-session";
import connect from "connect-session-sequelize";
import User from "./models/user.js";
import BlogPost from "./models/blog-post.js";
import Comment from "./models/comment.js";

const app = express();
const PORT = process.env.PORT || 3002; //Heroku || localhost port number
const bcrypt = require("bcrypt");
// Set up session middleware
const SequelizeStore = connect(session.Store);

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    store: new SequelizeStore({
      db: db,
    }),
    resave: false,
    proxy: true,
    cookie: {
      // Expires in one hour.
      maxAge: 1000 * 60 * 60,
    },
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

app.get("/dashboard", async (req, res) => {
  if (!req.session.userId) {
    res.redirect("/login");
    return;
  }

  res.render("dashboard", {
    posts: (
      await BlogPost.findAll({
        raw: true,
        order: [["datePosted", "DESC"]],
        where: { userId: req.session.userId },
      })
    ).map((post) => ({
      ...post,
      datePosted: post.datePosted.toLocaleString("en-US"),
    })),
  });
});

app.post("/api/post", async (req, res) => {
  try {
    if (!req.session.userId) {
      res.status(403).send({ message: "Please login to do that." });
      return;
    }

    if (!req.body.title) {
      res.status(400).send({ message: "Please enter a title." });
      return;
    }

    if (!req.body.content) {
      res.status(400).send({ message: "Please enter post content." });
      return;
    }

    await BlogPost.create({
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

app.put("/api/post/:id/edit", async (req, res) => {
  try {
    if (!req.session.userId) {
      res.status(403).send({ message: "Please login to do that." });
      return;
    }

    if (
      req.session.userId !=
      (await BlogPost.findByPk(req.params.id, { raw: true })).userId
    ) {
      res.status(403).send({ message: "Unauthorized." });
      return;
    }

    if (!req.body.title) {
      res.status(400).send({ message: "Please enter a title." });
      return;
    }

    if (!req.body.content) {
      res.status(400).send({ message: "Please enter post content." });
      return;
    }

    await BlogPost.update(
      {
        title: req.body.title,
        content: req.body.content,
      },
      { where: { id: req.params.id } }
    );

    res.redirect("/dashboard");
  } catch (error) {
    res.status(500).send({ message: "Something went wrong." });
    console.log(error);
  }
});

app.delete("/api/post/:id/delete", async (req, res) => {
  try {
    if (!req.session.userId) {
      res.status(403).send({ message: "Please login to do that." });
      return;
    }

    if (
      req.session.userId !=
      (await BlogPost.findByPk(req.params.id, { raw: true })).userId
    ) {
      res.status(403).send({ message: "Unauthorized." });
      return;
    }

    const post = await BlogPost.findOne({ where: { id: req.params.id } });

    post.destroy();

    res.redirect("/dashboard");
  } catch (error) {
    res.status(500).send({ message: "Something went wrong." });
    console.log(error);
  }
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

app.get("/post/:id/edit", async (req, res) => {
  const post = (await BlogPost.findByPk(req.params.id)).get({ plain: true });

  res.render("edit-post", {
    post: {
      ...post,
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

app.listen(PORT, () => console.log("server running." + PORT));
