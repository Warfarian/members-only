const { Router } = require("express");
const router = Router();
const membersController = require("../controllers/membersController");
const { isAdmin } = require("../db/queries");
const pool  = require("../db/pool");


router.get('/', membersController.renderSignUpForm);
router.get('/sign-in', membersController.renderSignInForm);
router.get('/home', membersController.fetchAllMessages);
router.post('/home', membersController.addNewMessage);
router.get('/secretForm', membersController.renderSecret);  
router.post('/secretForm', membersController.addNewMessage); 
router.get('/secretHome', membersController.fetchAllMessages);
router.post('/secretHome', membersController.addNewMessage);

router.post('/delete-message', async (req, res, next) => {
    if (!req.user) return res.status(401).send('Unauthorized');
    
    try {
        const adminStatus = await isAdmin(req.user.user_id);
        if (!adminStatus) return res.status(403).send('Forbidden');
        
        const { message } = req.body;
        await pool.query("DELETE FROM messages WHERE message = $1", [message]);
        res.redirect('/secretHome');
    } catch (err) {
        next(err);
    }
});

module.exports = router;