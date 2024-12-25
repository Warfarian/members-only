const { Router } = require("express");
const router = Router();

router.get('/', (req,res) => {
    res.render("sign-up.ejs")
});


router.get('/sign-in', (req,res) => {
    res.render("sign-in.ejs")
});

module.exports = router;