const {addMessage, getAllMessages, getSpecificMessages } = require("../db/queries");


function renderSignInForm(req,res){
    res.render("sign-in.ejs")
}

function renderSignUpForm(req,res){
    res.render("sign-up.ejs")
}

function fetchSpecificMessages(req,res){
    const result = getSpecificMessages();
    console.log(result);
    res.render("home", {result});
    return result;
}

async function fetchAllMessages(req,res){
    try{
        const results = await getAllMessages(); 
        if (results && results.length > 0){
            res.render("home", {results});
        }
        else{
            console.log("nothing fetched");
            res.render("home");
        }
    }catch(err){
        console.error("error fetching all messages controller");
    }
}


async function addNewMessage(req, res) {
    const { message } = req.body;
    if (!message) {
        return res.status(400).send("Message cannot be empty");
    }

    const userId = res.locals.user_id;
    if (!userId) {
        return res.status(401).send("User not authenticated");
    }

    try {
        
        await addMessage(userId, message); 
        console.log("User ID:", userId, "Message:", message);
        res.redirect('/home'); 
    } catch (err) {
        console.error("Error adding message:", err);
        res.status(500).send("Error adding message");
    }
}



module.exports = {renderSignInForm, renderSignUpForm, fetchAllMessages, addNewMessage, fetchSpecificMessages };