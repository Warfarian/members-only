const { Router } = require("express");
const router = Router();
const membersController = require("../controllers/membersController");


router.get('/', membersController.renderSignUpForm);
router.get('/sign-in', membersController.renderSignInForm);
router.get('/home', membersController.fetchAllMessages);
router.post('/home', membersController.addNewMessage);

module.exports = router;