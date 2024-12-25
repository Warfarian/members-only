const express = require("express");
const session = require("express-session");
const pool = require("./db/pool");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const path = require("node:path");
const router = require("./routes/router");
const sessionMiddleware = require("./config/session");

require("dotenv").config();

const app = express();

app.set("views", path.join(__dirname, "views"))
app.set("view engine", "ejs");

app.use(sessionMiddleware);

app.use('/', router);
app.use('/sign-in', router);

app.listen(process.env.PORT, ()=> console.log(`Listening on port ${process.env.PORT}`));


