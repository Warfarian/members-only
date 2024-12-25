const express = require("express");
const pool = require("./db/pool");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const path = require("node:path");
const router = require("./routes/router");
const { randomUUID } = require("crypto");
const sessionMiddleware = require("./config/session");
const { body, validationResult } = require("express-validator");

require("dotenv").config();

const app = express();

app.set("views", path.join(__dirname, "views"))
app.set("view engine", "ejs");

app.use(sessionMiddleware);
app.use(express.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
    if (req.isAuthenticated()) {
        res.locals.user_id = req.user.user_id;
    }
    next();
});


app.use('/', router);
app.use('/sign-in', router);
app.use('/home', router);
app.use('/secretForm', router);
app.use('/secretHome', router);

app.use(express.static(path.join(__dirname,"public")));

app.get('/sign-out', (req,res,next) => {
    req.logout((err)=>{
        if (err){
            return next(err)
        }
        res.redirect('/');
    });
});

app.post("/sign-in", passport.authenticate("local", {
    successRedirect: "/home",
    failureRedirect: "/sign-in",
    failureFlash: true
}));

app.post(
    "/",
    [
        body('firstName').notEmpty().withMessage("First name is required"),
        body('lastName').notEmpty().withMessage("Last name is required"),
        body('username').notEmpty().withMessage("Invalid username"),
        body('password').notEmpty().withMessage("Password cannot be empty"),
        body('confirmPassword').custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error("Password confirmation does not match");
            }
            return true;
        }),
    ],
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          
            return res.status(400).render("signup", {
                errors: errors.array(),
                formData: req.body, 
            });
        }

        try {
            await pool.query("BEGIN");
            const hashedPassword = await bcrypt.hash(req.body.password, 10);
            const userId = randomUUID();

            await pool.query(
                "INSERT INTO users (user_id, first_name, last_name, username, password) VALUES ($1, $2, $3, $4, $5)",
                [
                    userId,
                    req.body.firstName,
                    req.body.lastName,
                    req.body.username,
                    hashedPassword,
                ]
            );

            await pool.query("INSERT INTO members (user_id, status) VALUES ($1, $2)", [
                userId,
                "guest",
            ]);

            await pool.query("COMMIT");
            return res.redirect("/sign-in"); 
        } catch (error) {
            console.error("Error signing up:", error);
            await pool.query("ROLLBACK"); 
            return res.status(500).send("An error occurred while signing up.");
        }
    }
);



passport.use(new LocalStrategy(async (username, password, done) => {
    try {
        const { rows } = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
        const user = rows[0];

        if (!user) {
            console.log("Incorrect username");
            return done(null, false, { message: "Incorrect username" });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            console.log("Incorrect password");
            return done(null, false, { message: "Incorrect password" });
        }

        console.log("User authenticated successfully");
        return done(null, user); 
    } catch (err) {
        console.error("Error during authentication:", err);
        return done(err);
    }
}));


passport.serializeUser((user, done) => {
    done(null, user.user_id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const { rows } = await pool.query("SELECT * FROM users WHERE user_id = $1", [id]);
        const user = rows[0];
        if (!user) {
            return done(null, false); 
        }

        done(null, user); 
    } catch (err) {
        done(err); 
    }
});


app.listen(process.env.PORT, ()=> console.log(`Listening on port ${process.env.PORT}`));


