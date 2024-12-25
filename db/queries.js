const pool = require("./pool");

async function addMessage(user_id, message) {
    try{
        await pool.query("INSERT INTO messages (user_id, message) values ($1,$2)", [user_id,message]);
        console.log("Successfully added message");
    }
    catch(err){
        console.error("Error adding message to db", err);
    }
}

async function getSpecificMessages(user_id) {
    try{
        const message = await pool.query("SELECT message from messages where user_id = $1", [user_id]);
        console.log("Successfully got the message");
        return message.rows;
    }catch(err){
        console.error("Error getting message from database", err);
    }
}

async function getAllMessages(){
    try{
        const message = await pool.query("SELECT * from messages");
        console.log("Successfully got all messages");
        return message.rows;
    }catch(err){
        console.error("Error getting all the messages from database", err);
        throw new Error("Failed to fetch messages");
    }
}

module.exports = { addMessage, getAllMessages, getSpecificMessages}