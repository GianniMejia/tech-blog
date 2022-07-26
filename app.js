import express from "express";

import { engine } from "express-handlebars";

const app = express();

app.engine("handlebard", engine());
app.set("view engine", "handlebars");
app.set("views", "./views");

app.get("/", (req, res) => {
  res.render("home");
});

app.listen(3001, () => console.log("server running."));
