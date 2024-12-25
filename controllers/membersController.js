const pool = require("../db/pool");
const {addMessage, getAllMessages, getSpecificMessages, getUsernameById } = require("../db/queries");

require("dotenv").config()

function renderSignInForm(req,res){
    res.render("sign-in.ejs")
}

function renderSignUpForm(req,res){
    res.render("sign-up.ejs")
}

function fetchSpecificMessages(req,res){
    const result = getSpecificMessages();
    console.log(result);
    if (req.user.session){
        res.render("home", {result});
        return result;
    }
}

async function fetchAllMessages(req,res){
    try {
        const results = await getAllMessages();
        const currentUsername = req.user ? await getUsernameById(req.user.user_id) : null;
        const user_id = req.user ? req.user.user_id : null;

        if (await checkStatus(req.user?.user_id) === 'elite') {
            res.render("secretHome", { results, username: currentUsername, user_id });
        } else {
            res.render("home", { results, username: currentUsername, user_id });
        }
    } catch (err) {
        console.error("Error fetching all messages:", err);
        res.redirect('/sign-in');
    }
}

async function addNewMessage(req, res) {
    const { message, originalUserId } = req.body;
    let username = 'guest101';

    try {
        if (originalUserId) {
            const result = await pool.query("SELECT username FROM users WHERE user_id = $1", [originalUserId]);
            if (result.rows.length > 0) {
                username = result.rows[0].username;
            }
        }

        if (!message) {
            return res.status(400).send("Message cannot be empty");
        }

        await addMessage(originalUserId || null, message, username);
        console.log("Successfully added message");

        if (originalUserId) {
            const status = await checkStatus(originalUserId);
            if (status === 'elite') {
                return res.redirect('/secretHome');
            }
        }
        return res.redirect('/home');

    } catch (err) {
        console.error("Error adding message:", err);
        res.status(500).send("Error adding message");
    }
}

async function checkStatus(userId) {
    try {
        
        const result = await pool.query("SELECT status FROM members WHERE user_id = $1", [userId]);
        
        if (result.rows.length > 0) {
            return result.rows[0].status;  
        } else {
            throw new Error('User not found in members table');
        }
    } catch (err) {
        console.error("Error fetching user status", err);
        throw err;
    }
}

async function renderSecret(req, res) {
    try {
        const userId = res.locals.user_id || req.user.user_id; 
        const status = await checkStatus(userId); 
        const results = await getAllMessages();

        let username = null;
        if (userId) {
            username = await getUsernameById(userId);
        }

        if (status === 'elite') {
            res.render('secretHome', { results, username });
        } else {
            res.render('secretForm');
        }
    } catch (err) {
        console.error("Error checking user status", err);
        res.status(500).send('Internal Server Error');
    }
}


module.exports = {renderSignInForm, renderSignUpForm, fetchAllMessages, addNewMessage, fetchSpecificMessages, renderSecret, checkStatus };