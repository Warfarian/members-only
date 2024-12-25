const { Router } = require("express");
const router = Router();
const membersController = require("../controllers/membersController");


router.get('/', membersController.renderSignUpForm);
router.get('/sign-in', membersController.renderSignInForm);
router.get('/home', membersController.fetchAllMessages);
router.post('/home', membersController.addNewMessage);
router.get('/secretForm', membersController.renderSecret);  
router.post('/secretForm', membersController.addNewMessage); 
router.get('/secretHome', membersController.fetchAllMessages);
router.post('/secretHome', membersController.addNewMessage);

module.exports = router;