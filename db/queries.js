const pool = require("./pool");

async function addMessage(user_id, message, username) {
    try {
        await pool.query("INSERT INTO messages (user_id, message, username) VALUES ($1, $2, $3)", 
            [user_id, message, username]);
        console.log("Successfully added message");
    } catch (err) {
        console.error("Error adding message to db", err);
        throw err;
    }
}

async function getSpecificMessages(user_id) {
    try {
        const message = await pool.query("SELECT message from messages where user_id = $1", [user_id]);
        console.log("Successfully got the message");
        return message.rows;
    } catch (err) {
        console.error("Error getting message from database", err);
    }
}

async function getAllMessages() {
    try {
        const message = await pool.query("SELECT * FROM messages");
        console.log("Successfully got all messages");
        return message.rows;
    } catch (err) {
        console.error("Error getting all the messages from database", err);
        throw new Error("Failed to fetch messages");
    }
}

async function getUsernameById(user_id) {
    try {
        const result = await pool.query("SELECT username FROM users WHERE user_id = $1", [user_id]);
        if (result.rows.length > 0) {
            console.log(result.rows[0])
            return result.rows[0].username; 
        } else {
            throw new Error("User not found");
        }
    } catch (err) {
        console.error("Error fetching username from database", err);
        throw err; 
    }
}

module.exports = { addMessage, getAllMessages, getSpecificMessages, getUsernameById };